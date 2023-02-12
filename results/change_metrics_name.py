import os

if __name__ == '__main__':
    crowdworks_labels = os.listdir(os.path.join('CrowdWorks', 'crowdscouringlabel'))
    prolific_labels = os.listdir(os.path.join('Prolific', 'crowdscouringlabel'))
    root = os.path.join('CrowdWorks', 'crowdscouringlabel')
    text = ''
    for file in crowdworks_labels:
        with open(os.path.join(root, file), encoding='utf-8') as f:
            text = f.read()
            text = text.replace('importance', 'informativeness')
        with open(os.path.join(root, file), 'w', encoding='utf-8') as f:
            f.write(str(text))
    root = os.path.join('Prolific', 'crowdscouringlabel')
    for file in prolific_labels:
        with open(os.path.join(root, file), encoding='utf-8') as f:
            text = f.read()
            text = text.replace('importance', 'informativeness')
        with open(os.path.join(root, file), 'w', encoding='utf-8') as f:
            f.write(str(text))
