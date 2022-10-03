import requests
import cv2
import csv
import time
class crawler:
	def __init__(self):
		pass

	def download_image_from_list(self, list_path):
		with open(list_path, 'r') as f:
			n = 0
			lines = f.readlines()
			while True:
				try:
					print('start')
					time.sleep(5)
					res = requests.get(lines[n].split()[1])
					name = './data/train_image/' + lines[n].split()[0] + '.jpg'
					with open(name, 'wb') as f1:
						f1.write(res.content)
					n += 1
					print('finish')
					if n >= len(lines):
						break
				except Exception as e: 
					print(e)
					print('error when downloading {}'.format(lines[n].split()[0]))

	def generate_list(self, input_path, csv_path, output_path):
		link = []
		imageID = []
		with open(csv_path, encoding='utf-8') as f:
			with open(input_path, 'r') as f1:
				for line in f1:
					imageID.append(line.split('/')[1].strip())
				#print(imageID)
				res = csv.reader(f)
				flag = 0
				for row in res:
					if not flag:
						flag = 1
						continue
					if row[0] in imageID:
						link.append(row[0] + ' ' + row[2])		
		with open('image_path.txt', 'w') as f:
			for i in link:
				f.write(i + '\n')

if __name__ == '__main__':
	crawler = crawler()
	crawler.download_image_from_list('image_path.txt')
	'''crawler.generate_list('train_image.txt', 
		'./csv/oidv6-train-images-with-labels-with-rotation.csv',
		'image_path.txt')'''