import os
import csv
import json

def image_list():
	root = './data/test_image'
	images = os.listdir(root)

	with open('image_url.csv', 'w') as f:
		f.write('image_url\n')
		for img in images:
			f.write(img + '\n')


def generate_annotation(csv_path):
	#set them to the same class num
	image_id = {'Identity': 7, 'Ticket': 7}

	with open(csv_path, 'r') as f:
		res = csv.reader(f)
		flag = 0
		for row in res:
			if not flag:
				flag = 1
				continue
			name = './data/validation_image_label/' + row[27][:-4] + '.txt'
			print(row[28])
			data = json.loads(row[28])
			if len(data):
				width = int(row[30])
				height = int(row[29])
				with open(name, 'w') as f1:
					for i in data:
						i = dict(i)
						x = i['left'] / width
						y = i['top'] / height
						w = i['width'] / width
						h = i['height'] / height
						label = i['label']
						x_center = x + w/2
						y_center = y + h/2
						f1.write(str(image_id[label]) + ' ' + str(x_center)+' '+str(y_center)+' '+str(w)+' '+ str(h)+'\n')

def copy_file(epoch, input_folder, output_folder, postfix):
	images = os.listdir(input_folder)
	for i in range(epoch):
		for img in images:
			name = img[:-4]
			name = name + '_' + str(i) + postfix
			command = 'cp ' + os.path.join(input_folder,img) + ' ' + os.path.join(output_folder,name)
			#print(command)
			os.system(command)


#image_list()
generate_annotation('validation_image.csv')
#copy_file(10, './data/train_image_label', './data/new_train_image_label', '.txt')