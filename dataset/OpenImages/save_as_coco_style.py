import json
import os
import csv
import cv2
import numpy as np
import argparse

class save_as_coco_style:

	def __init__(self, input_path, output_path):
		self.input_path = input_path
		self.output_path = output_path
		# if balancing the data set
		self.if_avg = True
		self.json = {'info': {'description': 'COCO 2017 Dataset', 
		'url': 'http://cocodataset.org', 'version': '1.0', 'year': 2017, 
		'contributor': 'COCO Consortium', 'date_created': '2017/09/01'},
		'licenses': [{'url': 'http://creativecommons.org/licenses/by-nc-sa/2.0/', 
		'id': 1, 'name': 'Attribution-NonCommercial-ShareAlike License'}, 
		{'url': 'http://creativecommons.org/licenses/by-nc/2.0/', 
		'id': 2, 'name': 'Attribution-NonCommercial License'}, 
		{'url': 'http://creativecommons.org/licenses/by-nc-nd/2.0/', 
		'id': 3, 'name': 'Attribution-NonCommercial-NoDerivs License'}, 
		{'url': 'http://creativecommons.org/licenses/by/2.0/', 
		'id': 4, 'name': 'Attribution License'}, 
		{'url': 'http://creativecommons.org/licenses/by-sa/2.0/', 
		'id': 5, 'name': 'Attribution-ShareAlike License'}, 
		{'url': 'http://creativecommons.org/licenses/by-nd/2.0/', 
		'id': 6, 'name': 'Attribution-NoDerivs License'}, 
		{'url': 'http://flickr.com/commons/usage/', 
		'id': 7, 'name': 'No known copyright restrictions'}, 
		{'url': 'http://www.usa.gov/copyright.shtml', 
		'id': 8, 'name': 'United States Government Work'}],
		 'images': [], 'annotations': [], 'categories': []}

		self.labelname_bbox = {'person': ['/m/0dzct'], 'place': ['/m/021sj1', '/m/01mqdt'], 
		'screen': ['/m/02522', '/m/0bh9flk', '/m/01c648', '/m/07c52'], 
		'plate': ['/m/01jfm_'],'food': ['/m/02wbm', '/m/02xwb'], 'book': ['/m/0bt_c3'], 
		'table': ['/m/0h8n5zk', '/m/04bcr3']}

		self.category_id = {'person': 1, 'place': 2, 'screen': 3, 'plate': 4,
		'food': 5, 'book': 6, 'table': 7, 'ticket': 8, 'ID': 9}

		self.labelname_image = {'ticket': '/m/02py351', 'ID': '/m/01_v7j'}

		self.saved_images = {}

	def generate_categories(self):
		categories = [{'id': 1, 'name': 'person', 'supercategory': 'person'}, 
		{'id': 2, 'name': 'place', 'supercategory': 'place'},
		{'id': 3, 'name': 'screen', 'supercategory': 'screen'},
		{'id': 4, 'name': 'plate', 'supercategory': 'plate'},
		{'id': 5, 'name': 'room', 'supercategory': 'room'},
		{'id': 6, 'name': 'food', 'supercategory': 'food'},
		{'id': 7, 'name': 'book', 'supercategory': 'book'},
		{'id': 8, 'name': 'table', 'supercategory': 'table'}]

		return categories


	def generate_images(self,folder, row, ID):
		image = {"id": ID, "width": int, 
		"height": int, "file_name": str, 
		"license": 1, "flickr_url": '', 
		"coco_url": '', "date_captured": ''}
		name = row[0] + '.jpg'
		image['file_name'] = name
		im = cv2.imread(os.path.join(folder, name))
		try:
			image['height'] = im.shape[0]
			image['width'] = im.shape[1]
			return image
		except:
			return -1

	def generate_annotations(self,folder, row, ID):
		annotation = {"id": ID, "image_id": int, 
		"category_id": int, "segmentation": [[]], 
		"area": 0, "bbox": [], "iscrowd": 0}
		annotation['image_id'] = self.saved_images[row[0]]
		#get category_id
		for key, value in self.labelname_bbox.items():
			if row[1] in value:
				annotation['category_id'] = self.category_id[key]
		#calculate absolute bbox
		#row[2-5] XMin	XMax	YMin	YMax
		name = row[0] + '.jpg'
		im = cv2.imread(os.path.join(folder, name))
		height = im.shape[0]
		width = im.shape[1]
		x = round(width * float(row[2]), 2)
		y = round(height * float(row[4]), 2)
		w = round(width * (float(row[3]) - float(row[2])), 2)
		h = round(height * (float(row[5]) - float(row[4])), 2)
		annotation['bbox'] = [x, y, w, h]

		return annotation

	def print_csv_len(self, folder):
		csv_path = os.path.join('./categories/', 'label_' + folder + '.csv')
		with open(csv_path, 'r') as f:
			res = csv.reader(f)
			len_csv = sum([1 for i in res])
			print(len_csv)
			return len_csv

	def generate_json(self,folder, len_csv):
		images_list = os.listdir(os.path.join(self.input_path, folder))
		csv_path = os.path.join('./categories/', 'label_' + folder + '.csv')
		images = []
		annotations = []
		categories = self.generate_categories()
		with open(csv_path) as f, open('./csv/oidv6-class-descriptions.csv') as f1:
			skipped_image = 0
			res = csv.reader(f)
			flag = 0
			annotation_cnt = 1
			cnt = 0
			for row in res:
				if not flag:
					flag = 1
					continue 
				if row[0] not in self.saved_images.keys():
					ID = len(self.saved_images.keys()) + 1
					self.saved_images[row[0]] = ID
					images_info = self.generate_images(os.path.join(self.input_path, folder),row, ID)
					if images_info == -1:
						skipped_image += 1
						continue
					else:
						images.append(images_info)
				if images_info == -1:
						continue
				annotations.append(self.generate_annotations(os.path.join(self.input_path, folder),row, annotation_cnt))
				annotation_cnt += 1
				cnt += 1
				if cnt % 1000 == 0:
					print('skipped:', skipped_image)
					print('{}/{}'.format(cnt, len_csv))
		self.json['images'] = images
		self.json['annotations'] = annotations
		self.json['categories'] = categories
		with open(self.output_path, 'w') as f:
		    json.dump(self.json, f)

	def generate_yolo_style(self, folder, len_csv):
		images_list = os.listdir(os.path.join(self.input_path, folder))
		csv_path = os.path.join('./categories/', 'label_' + folder + '.csv')
		image_count = {'person': 0, 'place': 0, 'screen': 0, 'plate': 0,
		'food': 0, 'book': 0, 'table': 0}
		with open(csv_path) as f, open('./csv/oidv6-class-descriptions.csv') as f1:
			skipped_image = 0
			res = csv.reader(f)
			flag = 0
			annotation_cnt = 1
			cnt = 0
			last_img = None 
			images_info = -1
			writer = open('./test.txt', 'w')
			for row in res:
				if not flag:
					flag = 1
					continue 
				if not row[0] == last_img:
					try:
						img = cv2.imread('./data/' + folder + '/' + row[0] + '.jpg')
						w = img.shape[0]
						images_info = 1
					except:
						print('cannot read the image: ' + row[0] + '.jpg')
						images_info = -1
					if images_info == 1:
						writer.close()
						writer = open('./data/labels/' + folder +'/'+ row[0] + '.txt', 'w')
						for key, value in self.labelname_bbox.items():
							if row[1] in value:
								image_count[key] += 1
				if images_info == -1:
					skipped_image += 1
					continue
				for key, value in self.labelname_bbox.items():
					if row[1] in value:
						writer.write(str(self.category_id[key] - 1) + ' ')
						break
				x_center = (float(row[2]) + float(row[3])) / 2
				y_center = (float(row[4]) + float(row[5])) / 2
				width = (float(row[3]) - float(row[2])) / 2
				height = (float(row[5]) - float(row[4])) / 2
				writer.write(str(x_center) + ' ' + str(y_center) + ' ' + str(width) + ' ' + str(height) + '\n')
				cnt += 1
				if cnt % 1000 == 0:
					print('skipped:', skipped_image)
					print('{}/{}'.format(cnt, len_csv))
				last_img = row[0]
		print(image_count)


	def test_json(self, file_path):
		with open(file_path, 'r') as f:
			data = json.load(f)
			print(len(data['annotations']))
			print(len(data['images']))
			print(data['annotations'][0])
			print(data['images'][0])
			print(data['categories'])
			print(data['info'])
			print(data['licenses'])
			#count categories id 
			cnt = {}
			for i in data['annotations']:
				if i['category_id'] not in cnt.keys():
					cnt[i['category_id']] = 1
				else:
					cnt[i['category_id']] += 1
			print(cnt)

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--mode', type=str, default='train')
	opt = parser.parse_args()
	input_name = opt.mode + '_bbox'
	output_name = opt.mode + '.json'
	saver = save_as_coco_style('./data/', output_name)
	len_csv = saver.print_csv_len(input_name)
	saver.generate_yolo_style(input_name, len_csv)
	#saver.test_json(output_name)