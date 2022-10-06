from pprint import pp
from turtle import width
from unicodedata import name
from lvis import LVIS, LVISResults, LVISEval, LVISVis
import os
import json 
import cv2
import csv
import numpy as np

ANNOTATION_PATH = "./data/lvis_v1_val.json"
IMAGE_PATH = "./data/all2017"

class vis_dataset:

    def __init__(self) -> None:
        # map for category to category_id
        self.cat_id_map = dict()
        # map for category_id to category
        self.id_cat_map = dict()
        self.lvis_vis = LVISVis(lvis_gt=ANNOTATION_PATH, img_dir=IMAGE_PATH)
        self.lvis_gt = LVIS(ANNOTATION_PATH)
        self.MY_CAT = "Cigarettes"
        self.LVIS_CAT = ['cigarette']
        for key, value in self.lvis_gt.cats.items():
            self.cat_id_map[value['name']] = key
            self.id_cat_map[key] = value['name']

    def select_img_from_cat(self, cat_name=None) -> list:
        return self.lvis_gt.cat_img_map[self.cat_id_map[cat_name]]

    def read_ann(self, my_cat = None, img_id=None)->list:
        # current the annotation is just boundingboxes but not segmentation for simplicity
        folder_path = 'selected_label/' + my_cat
        anns = []
        if os.path.exists(folder_path):
            if os.path.exists(folder_path + '/' + str(img_id) + '_label'):
                with open(folder_path + '/' + str(img_id) + '_label') as f:
                    data = f.readlines()
                    for line in data:
                        # json only allow " " not ' '
                        line = line.replace("\'", "\"")
                        one_ann = json.loads(line)
                        anns.append({'polygon': one_ann['segmentation'], 
                        'bbox': one_ann['bbox'], 
                        'category': self.id_cat_map[one_ann['category_id']], 
                        'image_id': one_ann['image_id']})
        return anns

    def extract_img(self)->None:
        for cat in self.LVIS_CAT:
            img_list = self.select_img_from_cat(cat)
            for id in img_list:
                self.lvis_vis.vis_img(img_id=id, show_boxes=False, show_segms=False, show_classes= False, if_save = True, my_cat = self.MY_CAT)
                if not os.path.exists('./selected_label/' + self.MY_CAT):
                    os.mkdir('./selected_label/' + self.MY_CAT)
                with open('./selected_label/' + self.MY_CAT + '/' + str(id) + '_label', 'w') as f:
                    for i, ann in enumerate(self.lvis_gt.img_ann_map[id]):
                        ann['height'] = self.lvis_gt.imgs[id]['height']
                        ann['width'] = self.lvis_gt.imgs[id]['width']
                        ann['category'] = self.id_cat_map[ann['category_id']]
                        ann['source'] = 'LVIS'
                        if i == len(self.lvis_gt.img_ann_map[id]) - 1:
                            f.write(str(ann))
                        else:
                            f.write(str(ann) + '\n')
                    

    def vis_img(self, my_cat=None, img_id = None)->None:
        anns = self.read_ann(my_cat, img_id)
        img_path = './selected_img/' + str(my_cat) + '/' + str(img_id) + '.jpg'
        print(self.lvis_gt.imgs[img_id])
        if os.path.exists(img_path):
            img = cv2.imread(img_path)
            #img = cv2.resize(img,(self.lvis_gt.imgs[img_id]['width'], self.lvis_gt.imgs[img_id]['height']))
            for ann in anns:
                x, y, w, h = ann['bbox']
                x, y, w, h = int(x), int(y), int(w), int(h)
                cv2.rectangle(img, (x,y),(x+w,y+h),(0,255,0),2)
                cv2.putText(img, ann['category'],(x+w+10,y+h),0,0.3,(0,255,0))

            cv2.imshow(str(my_cat) + '_' + str(img_id), img)
            cv2.waitKey()
        else:
            print('no img, quit')
            return 
    
    def generate_all_qualified_lvis_image(self)->None:
        with open('./mycat_lvis_map.csv') as f:
            res = csv.reader(f)
            flag = 0
            for row in res:
                if not flag:
                    flag = 1
                    continue
                self.MY_CAT = row[0]
                print(self.MY_CAT)
                self.LVIS_CAT = row[1].split('|')
                skip = 0
                for one_cat in self.LVIS_CAT:
                    # skip those which we cannot get from LVIS
                    print(one_cat)
                    if 'OpenImages' in one_cat or 'None' in one_cat:
                        skip = 1
                        break
                if skip:
                    continue
                self.extract_img()



if __name__ == '__main__':
    vis_data = vis_dataset()
    vis_data.generate_all_qualified_lvis_image()
    #vis_data.extract_img()
    #print(len(vis_data.select_img_from_cat(MY_CAT)))
    #vis_data.vis_img(MY_CAT, 21879)
    #extract_img()