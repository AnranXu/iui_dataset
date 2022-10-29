import os 
import json

if __name__ == '__main__':
    ## we need to make a version for publication that hide worker's id in the file
    dirname = 'dataset/annotations'
    with open('./img_annotation_map.json') as f:
        text = f.read()
        img_annotation_map = json.loads(text)
        for img_name, annotations in img_annotation_map.items():
            label_num = 0
            for platform, labels in annotations.items():
                for label in labels:
                    label_info = None
                    with open(os.path.join(platform, 'crowdscouringlabel', label)) as f1:
                        text = f1.read()
                        label_info = json.loads(text)
                        for key, value in label_info['defaultAnnotation'].items():
                            label_info['defaultAnnotation'][key]['informativeness'] = int(label_info['defaultAnnotation'][key]['importance'])
                            del label_info['defaultAnnotation'][key]['importance']
                        for key, value in label_info['manualAnnotation'].items():
                            label_info['manualAnnotation'][key]['informativeness'] = int(label_info['manualAnnotation'][key]['importance'])
                            del label_info['manualAnnotation'][key]['importance']
                        

                    with open(os.path.join(dirname, platform, 'labels', label), 'w') as w:
                        json.dump(label_info, w)
                    
                    #reading worker info
                    worker_id = ''
                    middle_part = label.split('_')[1:-1]
                    for i, name in enumerate(middle_part):
                        if i == len(middle_part) - 1:
                            worker_id = worker_id + name
                        else:
                            worker_id = worker_id + name + '_'
                    worker_file = worker_id + '.json'
                    worker_info = None
                    with open(os.path.join(platform, 'workerinfo', worker_file)) as f1:
                        text = f1.read()
                        worker_info = json.loads(text)
                        if platform == 'CrowdWorks':
                            worker_info['nationality'] = 'Japan'
                        ori_bigfive  = worker_info['bigfives']
                        worker_info['bigfives'] = {'Extraversion':  0, 'Agreeableness': 0, 'Conscientiousness': 0, 'Neuroticism': 0, 'Openness to Experience': 0}
                        worker_info['bigfives']['Extraversion'] = 6 - int(ori_bigfive[0]) + int(ori_bigfive[5])
                        worker_info['bigfives']['Agreeableness'] = 6 - int(ori_bigfive[6]) + int(ori_bigfive[1])
                        worker_info['bigfives']['Conscientiousness'] = 6 - int(ori_bigfive[2]) + int(ori_bigfive[7])
                        worker_info['bigfives']['Neuroticism'] = 6 - int(ori_bigfive[3]) + int(ori_bigfive[8])
                        worker_info['bigfives']['Openness to Experience'] = 6 - int(ori_bigfive[4]) + int(ori_bigfive[9])
                        del worker_info['name']

                    with open(os.path.join(dirname, platform, 'workerinfo', worker_file), 'w') as w:
                        json.dump(worker_info, w)
