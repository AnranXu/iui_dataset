import os
import cv2
import json 

# we choose 100 images for each category (50 from LVIS, 50 from OpenImage)
# we set a max width and height in case we get oversize image
if __name__ == '__main__':
    max_length = 1200
    image_num_for_each = 100
    LVIS_ROOT = './LVIS/selected_img/'
    LVIS_LABEL_ROOT = './LVIS/selected_label/'
    OPENIMAGE_ROOT = './OpenImages/selected_img/'
    OPENIMAGE_LABEL_ROOT = './OpenImages/selected_label/'
    FEDERATED_ROOT = './federated_dataset/selected_img/'
    FEDERATED_LABEL_ROOT = './federated_dataset/selected_label/'
    mycats = ['Person', 'Place Identifier', 'Identity', 'Home interior', 'Vehicle Plate',
    'Bystander', 'Food', 'Paper&Document&Label', 'Screen', 'Clothing', 'Scenery',
    'Pet', 'Book', 'Photo', 'Machine', 'Table', 'Electronic Devices', 'Cosmetics', 'Toy',
    'Finger', 'Cigarettes', 'Musical instrument', 'Accessory']
    #we do not want duplicated images
    saved_img = []
    for mycat in mycats:
        # we first get the file number for each category in these two dataset
        # if either is less than 50, we need to require more from the other one.
        # if add up it is less than 100, we require the max number
        lvis_num = 0
        openimages_num = 0
        if not os.path.exists(FEDERATED_ROOT + mycat):
            os.mkdir(FEDERATED_ROOT + mycat)
        if not os.path.exists(FEDERATED_LABEL_ROOT + mycat):
            os.mkdir(FEDERATED_LABEL_ROOT + mycat)
        if os.path.exists(LVIS_ROOT + mycat):
            lvis_num = len(os.listdir(LVIS_ROOT + mycat))
        if os.path.exists(OPENIMAGE_ROOT + mycat):
            openimages_num = len(os.listdir(OPENIMAGE_ROOT + mycat))
        if lvis_num + openimages_num >= 100:
            if lvis_num < 50:
                openimages_num = 100 - lvis_num
            elif openimages_num < 50:
                lvis_num = 100 - openimages_num
            else:
                lvis_num = 50
                openimages_num = 50
        if lvis_num:
            lvis_imgs = sorted(os.listdir(LVIS_ROOT + mycat))
        if openimages_num:
            openimages_imgs = sorted(os.listdir(OPENIMAGE_ROOT + mycat))
        lvis_cur = 0
        openimages_cur = 0
        while lvis_num:
            img = cv2.imread(os.path.join(LVIS_ROOT, mycat, lvis_imgs[lvis_cur]))
            if img.shape[0] <= max_length and img.shape[1] <= max_length and lvis_imgs[lvis_cur] not in saved_img:
                cv2.imwrite(os.path.join(FEDERATED_ROOT, mycat, lvis_imgs[lvis_cur]), img)
                cv2.imwrite(os.path.join('./federated_dataset/all_img', lvis_imgs[lvis_cur]), img)
                with open(os.path.join(LVIS_LABEL_ROOT,mycat,lvis_imgs[lvis_cur][:-4] + '_label')) as f,\
                    open(os.path.join(FEDERATED_LABEL_ROOT,mycat,lvis_imgs[lvis_cur][:-4] + '_label'), 'w') as f1,\
                    open(os.path.join('./federated_dataset/all_label',lvis_imgs[lvis_cur][:-4] + '_label'), 'w') as f2:
                    res = f.read()
                    f1.write(res)
                    f2.write(res)
                lvis_num -= 1
                saved_img.append(lvis_imgs[lvis_cur])
            lvis_cur += 1
            if lvis_cur >= len(lvis_imgs):
                break

        while openimages_num:
            img = cv2.imread(os.path.join(OPENIMAGE_ROOT, mycat, openimages_imgs[openimages_cur]))
            if img.shape[0] <= max_length and img.shape[1] <= max_length and openimages_imgs[openimages_cur] not in saved_img:
                cv2.imwrite(os.path.join(FEDERATED_ROOT, mycat, openimages_imgs[openimages_cur]), img)
                cv2.imwrite(os.path.join('./federated_dataset/all_img', openimages_imgs[openimages_cur]), img)
                with open(os.path.join(OPENIMAGE_LABEL_ROOT,mycat,openimages_imgs[openimages_cur][:-4] + '_label')) as f,\
                    open(os.path.join(FEDERATED_LABEL_ROOT,mycat,openimages_imgs[openimages_cur][:-4] + '_label'), 'w') as f1,\
                    open(os.path.join('./federated_dataset/all_label',openimages_imgs[openimages_cur][:-4] + '_label'), 'w') as f2:
                    res = f.read()
                    f1.write(res)
                    f2.write(res)
                openimages_num -= 1
                saved_img.append(openimages_imgs[openimages_cur])
            openimages_cur += 1
            if openimages_cur >= len(openimages_imgs):
                break
                

        