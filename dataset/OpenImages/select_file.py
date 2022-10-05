import csv
import random
import subprocess
import os
import numpy as np
import cv2
import json

class selecter:
	def __init__(self):
		# for image-level annotation
		self.labelname_image = {'ticket': '/m/02py351', 'ID': '/m/01_v7j'}
		self.filename_bbox = {'train': './csv/oidv6-train-annotations-bbox.csv', 
		'test': './csv/test-annotations-bbox.csv', 
		'validation': './csv/validation-annotations-bbox.csv'}
		self.filename_image = {'train': './csv/oidv6-train-annotations-human-imagelabels.csv', 
		'test': './csv/test-annotations-human-imagelabels.csv', 
		'validation': './csv/validation-annotations-human-imagelabels.csv'}

	#select categories that we need for training the model for downloader.py
	def write(self, level = 'bbox', mode = 'test', output_path = "test_bbox.txt"):
		# we also save the category for remain its taxonomy, so we need to output two file
		if level == 'bbox':
			with open(self.filename_bbox[mode]) as f, open(output_path, 'w') as f1, open('label_' + output_path.split('.')[0] + '.csv', 'w') as f2, open('mycat_openimages_map.csv') as f3:
				f2.write('ImageID,LabelName,XMin,XMax,YMin,YMax\n')
				image_list = []
				len_csv = 0
				#get list of category
				labelname_bbox = {}
				res = csv.reader(f3)
				flag = 0
				for row in res:
					if not flag:
						flag = 1
						continue
					labelname_bbox[row[0]] = row[1].split('|')
				res = csv.reader(f)
				flag = 0
				for row in res:
					if not flag:
						flag = 1
						continue
					for key, value in labelname_bbox.items():
						if 'None' in value:
							continue
						if row[2] in value:
							image_list.append(row[0])
							f2.write(row[0] + ',' + row[2] + ',' + row[4] + ',' + row[5] + ',' + row[6] + ',' + row[7] + '\n')
							break
					len_csv += 1
				print('before unique:', len(image_list))
				image_list = np.unique(image_list)
				print('after unique:', len(image_list))
				for row in image_list:
					f1.write(mode + '/' + row + '\n')

			'''with open(self.filename_bbox[mode]) as f:
				res = csv.reader(f)
				flag = 0
				cnt = 1
				for row in res:
					if not flag:
						flag = 1
						continue
					if row[0] in image_list:		 
						f2.write(row[0] + ',' + row[2] + ',' + row[4] + ',' + row[5] + ',' + row[6] + ',' + row[7] + '\n')
					print('{}/{}'.format(cnt,len_csv))
					cnt += 1'''
		elif level == 'image':
			with open(output_path, 'w') as f1, open('label_' + output_path.split('.')[0] + '.csv', 'w') as f2:
				label_num = {'ticket': 0, 'ID': 0}
				f2.write('ImageID,LabelName\n')
				with open(self.filename_image[mode]) as f:
					res = csv.reader(f)
					flag = 0
					for row in res:
						if not flag:
							flag = 1
							continue
						# skip if confidence is not 1
						if row[3] != '1':
							continue
						for key, value in self.labelname_image.items():
							if row[2] in value:
								label_num[key] += 1
								f1.write(mode + '/' + row[0] + '\n')
								f2.write(row[0] + ',' + row[2] + '\n')
								break

	#because the downloader can raise error when something is not exist, so we need to drop the image that is not exist by this way
	def run_downloader(self):
		file0 = 'train_image.txt'
		file1 = 'train_image1.txt'
		cmd = ['python', 'downloader.py', file0, '--download_folder=./data/image']
		n = 0
		while True:
			res = subprocess.Popen(cmd, stdout=subprocess.PIPE,stderr=subprocess.PIPE)
			out, err = res.communicate()
			err = err.decode('utf-8')
			print(err)
			err = err.split('`')
			if len(err) is not 3:
				continue
			else:
				print(err[1])
				with open(file0, 'r') as f:
					with open(file1, 'w') as f1:
						for line in f:
							if line.strip() == err[1].strip():
								print('occur,{}'.format(line))
								continue
							f1.write(line)
				os.system('rm ' + file0)
				os.system('cp ' + file1 + ' ' + file0)
				os.system('rm ' + file1)
			n += 1
			if n > 500:
				break
	
	def extract_img_bbox(self):
		img_root = './data/validation_bbox/'
		img_list = os.listdir(img_root)
		code_openimage_map = {}
		with open('./csv/oidv6-class-descriptions.csv') as f:
			res = csv.reader(f)
			for row in res:
				code_openimage_map[row[0]] = row[1]
		openimages_mycat_map = {}
		with open('mycat_openimages_map.csv') as f:
			res = csv.reader(f)
			flag = 0
			for row in res:
				if not flag:
					flag = 1
					continue
				openimages_cats = row[1].split('|')
				if 'None' in row[1]:
					continue
				for cat in openimages_cats:
					openimages_mycat_map[cat] = row[0]
		print(openimages_mycat_map)
		with open('./csv/validation-annotations-bbox.csv') as f:
			res = csv.reader(f)
			flag = 0
			last_img_name = ''
			images_info = -1
			anns = []
			for row in res:
				if not flag:
					flag = 1
					continue
				img_name = row[0] + '.jpg'
				
				if img_name in img_list:
					# if comes a new image 
					if not row[0] == last_img_name:
						if last_img_name != '':
							# we have many labels for one image, but only one or a few labels is the qualified one for locating into folder
							my_cats = []
							for ann in anns:
								if ann['category_code'] in openimages_mycat_map.keys():
									my_cats.append(openimages_mycat_map[ann['category_code']])
							# write previous data to each my_cat
							for my_cat in my_cats:
								if not os.path.exists('./selected_label/' + my_cat):
									os.mkdir('./selected_label/' + my_cat)
								if not os.path.exists('./selected_img/' + my_cat):
									os.mkdir('./selected_img/' + my_cat)
								with open('./selected_label/' + my_cat + '/' + last_img_name + '_label', 'w') as writer:
									for i, ann in enumerate(anns):
										if i == len(anns) - 1:
											writer.write(str(ann))
										else:
											writer.write(str(ann) + '\n')
								cv2.imwrite('./selected_img/' + my_cat + '/' + last_img_name + '.jpg', img)
							anns = []
						img = cv2.imread(img_root + img_name)
						width = img.shape[1]
						height = img.shape[0]
						images_info = 1
				else:
					images_info = -1

				if images_info == -1:
					continue
				x = int(float(row[4]) * width)
				y = int(float(row[6]) * height)
				w = int((float(row[5]) - float(row[4])) * width)
				h = int((float(row[7]) - float(row[6])) * height)
				ann = {'width': width, 'height': height, 'category_code': row[2], 'category': code_openimage_map[row[2]], 'bbox': [x,y,w,h], 'source': 'OpenImages'}
				anns.append(ann)
				last_img_name = row[0]

	#extract category 'identity' with our previous user study
	def extract_img_label(self):
		if not os.path.exists('./selected_img/Identity'):
			os.mkdir('./selected_img/Identity')
		if not os.path.exists('./selected_label/Identity'):
			os.mkdir('./selected_label/Identity')
		with open('./train_image.csv', 'r') as f:
			res = csv.reader(f)
			flag = 0
			for row in res:
				if not flag:
					flag = 1
					continue
				img_name = './data/image/' + row[27]
				if not os.path.exists(img_name):
					continue
				img = cv2.imread(img_name)
				label_name = './selected_label/Identity/' + row[27][:-4] + '_label'
				data = json.loads(row[28])
				if len(data):
					width = int(row[30])
					height = int(row[29])
					with open(label_name, 'w') as f1:
						for num, i in enumerate(data):
							i = dict(i)
							x = i['left']
							y = i['top']
							w = i['width']
							h = i['height']
							if num == len(data) - 1:
								f1.write(str({'category': 'identity', 'width': width, 'height': height, 'bbox': [x,y,w,h], 'source': 'OpenImages'}))
							else:
								f1.write(str({'category': 'identity', 'width': width, 'height': height, 'bbox': [x,y,w,h], 'source': 'OpenImages'}) + '\n')
					cv2.imwrite('./selected_img/Identity/' + row[27],img)
				
					
if __name__ == '__main__':
	selecter = selecter()
	selecter.extract_img_label()
	#selecter.write(level = 'bbox', mode = 'validation', output_path = 'validation_bbox.txt')
	#selecter.run_downloader()
