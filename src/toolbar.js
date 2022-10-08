import { Component } from "react";
//s3 uploader to our Amazon S3 storage for saving images. 
//I am not familar with uploading data to our own backend server by using secure ways (I only know ways like jQuery).
//Currently, I am not planning to deploy some backend intelligent cut properties so we do not need backend computations. 
//Also, always setting a server in Google/Amazon will cost us much money. So, I prefer using Amazon S3 to deploy our backend data transfer. 
import s3_handler from "./library/s3uploader.js";
import {Container, Row, Col, Card, ListGroup} from 'react-bootstrap';
import DefaultAnnotationCard from './defaultAnnotation.js';
import ManualAnnotationCard from "./manualAnnotation.js";
class Toolbar extends Component{
	constructor(props)
	{
        super(props);
        this.state = {bboxs: [], labelList: [], 
        curCat: '', curManualBbox: '', prevCat: '', defaultLabelClickCnt: 0,
        manualLabelClickCnt: 0};
        this.first_loading = true;
        this.image_ID = '';
        this.cur_source = '';
        this.task_record = {};
        this.platform = {'en': 'Prolific/',
        'jp': 'CrowdWorks/'};
        this.text = {'load': {'en': 'Load the next image', 'jp': '次の画像を読み込む'},
        'manualOn': {'en': 'Stop Creating Bounding Box', 'jp': 'バウンディングボックスの作成中止'},
        'manualOff': {'en': 'Create Bounding Box', 'jp': 'バウンディングボックスの作成'},
        'labelList': {'en': 'Label List', 'jp': 'ラベルリスト'},
        'manualList': {'en': 'Manual Label', 'jp': '手動ラベル'},
        'deleteManualBbox': {'en': 'Delete selected label', 'jp': '選択したラベルを削除する'},
        'privacyButton': {'en': 'The above content is not privacy-threatening',
        'jp': '上記の内容はプライバシーを脅かすものではありません'},
        'finishPopUp': {'en':'You have finished your task, thank you!', 'jp': 'タスクは完了です、ありがとうございました'}};
    }
    toolCallback = (childData) =>{
        console.log(childData);
        this.setState(childData);
    }
    uploadAnnotation = () =>{
        // collecting default annotation card
        var anns = {'source': this.cur_source, 'workerId': this.props.workerId, 'defaultAnnotation': {}, 'manualAnnotation': {}};
        //check if every default annotation contains users' input
        var ifFinished = true;
        for(var i = 0; i < this.state.labelList.length; i++)
        {
            var category = this.state.labelList[i];
            // if the user click not privacy, skip the check
            var ifNoPrivacy = document.getElementById('privacyButton-' + category).checked;
            if(ifNoPrivacy)
                continue;
            //check question 'what kind of information can this content tell?'
            var reason = document.getElementById('reason-' + category);
            var reason_input = document.getElementById('reasonInput-' + category);
            if(reason.value === '0' || (reason.value === '5' && reason_input.value === ''))
                ifFinished = false;
            //check question 'to what extent would you share this photo at most?'
            var sharing = document.getElementById('sharing-' + category);
            var sharing_input = document.getElementById('sharing-' + category);
            if(sharing.value === '0' || (sharing.value === '5' && sharing_input.value === ''))
                ifFinished = false;
            if(!ifFinished)
            {
                if(this.props.language === 'en')
                    alert('Please input your answer in default label ' + category);
                else if(this.props.language === 'jp')
                    alert('ラベル' + category + 'に答えを入力してください。');
                if(this.state.curCat !== category)
                    document.getElementById(category).click();
                return false;
            }
        }
        for(var i = 0; i < this.props.manualBboxs.length; i++)
        {
            var id = this.props.manualBboxs[i]['id'];
            var category_input = document.getElementById('categoryInput-' + id);
            if(category_input.value === '')
                ifFinished = false;
            var reason = document.getElementById('reason-' + id);
            var reason_input = document.getElementById('reasonInput-' + id);
            if(reason.value === '0' || (reason.value === '5' && reason_input.value === ''))
                ifFinished = false;
            //check question 'to what extent would you share this photo at most?'
            var sharing = document.getElementById('sharing-' + id);
            var sharing_input = document.getElementById('sharing-' + id);
            if(sharing.value === '0' || (sharing.value === '5' && sharing_input.value === ''))
                ifFinished = false;
            if(!ifFinished)
            {
                if(this.props.language === 'en')
                    alert('Please input your answer in manual label ' + id);
                else if(this.props.language === 'jp')
                    alert('手動ラベル' + id + 'に回答を入力してください。');
                if(this.state.curManualBbox !== String(id))
                    document.getElementById(id).click();
                return false;
            }
        }
        console.log(ifFinished);
        // upload the result 
        for(var i = 0; i < this.state.labelList.length; i++)
        {
            
            var category = this.state.labelList[i];
            anns['defaultAnnotation'][category] = {'category': category, 'reason': '', 'reasonInput': '', 'importance': 4, 
            'sharing': '', 'sharingInput': '', 'ifNoPrivacy': false};
            var ifNoPrivacy = document.getElementById('privacyButton-' + category).checked;
            if(ifNoPrivacy)
            {
                anns['defaultAnnotation'][category]['ifNoPrivacy'] = true;
                continue;
            }
            var reason = document.getElementById('reason-' + category);
            var reason_input = document.getElementById('reasonInput-' + category);
            var importance = document.getElementById('importance-' + category);
            var sharing = document.getElementById('sharing-' + category);
            var sharing_input = document.getElementById('sharingInput-' + category);
            anns['defaultAnnotation'][category]['reason'] = reason.value;
            anns['defaultAnnotation'][category]['reasonInput'] = reason_input.value;
            anns['defaultAnnotation'][category]['importance'] = importance.value;
            anns['defaultAnnotation'][category]['sharing'] = sharing.value;
            anns['defaultAnnotation'][category]['sharingInput'] = sharing_input.value;
        }
        for(var i = 0; i < this.props.manualBboxs.length; i++)
        {
            var id = this.props.manualBboxs[i]['id'];
            anns['manualAnnotation'][id] = {'category': '', 'bbox': [], 'reason': '', 'reasonInput': '', 'importance': 4, 
            'sharing': '', 'sharingInput': ''};
            var category_input = document.getElementById('categoryInput-' + id);
            var bboxs =  this.props.stageRef.current.find('.manualBbox');
            var bbox = [];
            for(var i = 0; i < bboxs.length; i++)
                if(bboxs[i].attrs['id'] === 'manualBbox-' + id)
                    bbox = bboxs[i];
            anns['manualAnnotation'][id]['category'] = category_input.value;
            anns['manualAnnotation'][id]['bbox'] = [bbox.attrs['x'], bbox.attrs['y'], bbox.attrs['width'], bbox.attrs['height']];
            var reason = document.getElementById('reason-' + id);
            var reason_input = document.getElementById('reasonInput-' + id);
            var importance = document.getElementById('importance-' + id);
            console.log(importance);
            var sharing = document.getElementById('sharing-' + id);
            var sharing_input = document.getElementById('sharingInput-' + id);
            anns['manualAnnotation'][id]['reason'] = reason.value;
            anns['manualAnnotation'][id]['reasonInput'] = reason_input.value;
            anns['manualAnnotation'][id]['importance'] = importance.value;
            anns['manualAnnotation'][id]['sharing'] = sharing.value;
            anns['manualAnnotation'][id]['sharingInput'] = sharing_input.value;

        }
        //clear all not privacy button
        for(var i = 0; i < this.state.labelList.length; i++)
        {
            var privacyButton = document.getElementById('privacyButton-' + this.state.labelList[i]);
            privacyButton.checked = false;
        }
        this.props.toolCallback({clearManualBbox: true});
        var s3 = new s3_handler(this.props.language, this.props.testMode);
        s3.updateAnns(this.image_ID, this.props.workerId, anns);
        return true;
    }
    readURL = (image_URL, label_URL) => {
        // fetch data from amazon S3
        var ori_bboxs = [];
        var label_list = {};
        fetch(label_URL).then( (res) => res.text() ) //read new label as text
        .then( (text) => {
            var ori_anns = text.split('\n'); // split it as each row has one annotation
            for(var i = 0; i < ori_anns.length; i++)
            {
                var json = ori_anns[i].replaceAll("\'", "\"");
                var cur_ann = JSON.parse(json); // parse each row as json file
                this.cur_source = cur_ann['source'];
                ori_bboxs.push({'bbox': cur_ann['bbox'], 'category': cur_ann['category'], 
                'width': cur_ann['width'], 'height': cur_ann['height']}); //get bbox (x, y, w, h), width, height of the image (for unknown reasons, the scale of bboxs and real image sometimes are not identical), and category
                //create list of category, we just need to know that this image contain those categories.
                label_list[cur_ann['category']] = 1;
            }
            this.setState({bboxs: ori_bboxs, labelList: Object.keys(label_list)});
        }
        ).then(() => {this.props.toolCallback({imageURL: image_URL, bboxs: ori_bboxs})})
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    loadData = () =>{
        /*Maintaining the list of bounding boxes from original dataset and annotators
        The url links to the file that contains all the existing bounding boxes 
        Each line of the file is one annotation
        One annotation has 'bbox': 'category': for generating bounding boxes and getting category
        */
        
        //for testing image change,
        new Promise((resolve, reject) => {
            var ifFinished = true;
            if(!this.first_loading)
            {
                ifFinished = this.uploadAnnotation();  
            }
            console.log(this.first_loading);
            resolve(ifFinished);
            // update the record then
        }).then((flag) =>{
            if(!this.first_loading && flag)
            {
                var task_num = this.task_record['worker_record'][this.props.workerId]['task_num'];
                this.task_record['worker_record'][this.props.workerId]['progress'] += 1; 
                this.task_record[task_num]['workerprogress'] += 1;
                console.log(this.task_record[task_num]);
                //var ifUpdateRecord = this.updateRecord();
                var s3_uploader = new s3_handler(this.props.language, this.props.testMode);
                var res = JSON.stringify(this.task_record);
                var name = '';
                if(this.props.testMode)
                    name = 'testMode/' + 'task_record.json';
                else
                    name = this.platform[this.props.language] + 'task_record.json';
                var textBlob = new Blob([res], {
                    type: 'text/plain'
                });
                var upload = s3_uploader.s3.upload({
                    Bucket: 'iui-privacy-dataset',
                    Key: name,
                    Body: textBlob,
                    ContentType: 'text/plain',
                    ACL: 'bucket-owner-full-control'
                });
                var promise = upload.promise();
                promise.then(()=>{
                    this.getLabel();
                });
            }
            else if(this.first_loading && flag)
            {
                this.getLabel();
                this.first_loading = false;
            }
            // load the new record and get labelURL and imageURL
        });
    }
    getLabel = ()=>{
        var prefix = 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/';
        var task_record_URL = '';
        if(this.props.testMode)
            task_record_URL = prefix+ 'testMode/' + 'task_record.json';
        else
            task_record_URL = prefix+ this.platform[this.props.language] + 'task_record.json';
        var image_URL = '';
        var label_URL = '';
        fetch(task_record_URL).then((res) => res.text()).then( (text) =>{
            //upload the annotation first
            text = text.replaceAll("\'", "\"");
            this.task_record = JSON.parse(text); // parse each row as json file
            //if this worker is back to his/her work
            var cur_progress = 0;
            var task_num = '0';
            if(this.props.workerId in this.task_record['worker_record'])
            {
                cur_progress = this.task_record['worker_record'][this.props.workerId]['progress'];
                task_num = this.task_record['worker_record'][this.props.workerId]['task_num'];
            }
            //create new record and move old record
            else{
                task_num = this.task_record['cur_progress'];
                if(parseInt(task_num) >= this.task_record['list_len'])
                {
                    task_num = '0';
                }
                this.task_record['worker_record'][this.props.workerId] = {};
                this.task_record['worker_record'][this.props.workerId]['progress'] = 0;
                this.task_record[task_num]['workerid'] = this.props.workerId;
                this.task_record[task_num]['workerprogress'] = 0;
                this.task_record['worker_record'][this.props.workerId]['task_num'] = task_num;
                this.task_record['cur_progress'] = String(parseInt(this.task_record['cur_progress']) + 1);
            }
            if(cur_progress >= 10)
            {
                alert(this.text['finishPopUp'][this.props.language]);
                if(this.props.language === 'en')
                    window.location.replace('https://app.prolific.co/submissions/complete?cc=C17L3MGU');
                return false;
            }
            this.image_ID = this.task_record[task_num]['img_list'][cur_progress];
            image_URL = prefix + 'all_img/'+ this.image_ID + '.jpg';
            label_URL = prefix + 'all_label/'+ this.image_ID + '_label';
            return true;
        }).then((flag) => {
            if(flag)
            {
                console.log(image_URL);
                console.log(label_URL);
                this.readURL(image_URL, label_URL);
            }
        });
    }
    changePrivacyButton = (e) => {
        //users may choose the default label as 'not privacy' to quickly annotating.
        console.log(e.target.checked);
    }
    createDefaultLabelList = () => {
        
        //list label according to the category
        return this.state.labelList.map((label,i)=>(
        <div key={'defaultLabelList-' + label}>
            <Container>
				<Row>
                    <Col md={12}>
                        <ListGroup.Item action key={'categoryList-'+label} id={label} onClick={this.chooseLabel}>
                            {label}
                        </ListGroup.Item>
                    </Col>
                </Row>
            </Container>
            <input type={'checkbox'} id={'privacyButton-' + label} onClick={this.changePrivacyButton}></input>
                <span>{this.text['privacyButton'][this.props.language]}</span>
            <div className={'defaultAnnotationCard'}>
                <DefaultAnnotationCard key={'defaultAnnotationCard-'+label} visibleCat={this.state.curCat} 
                category = {label} clickCnt={this.state.defaultLabelClickCnt}language = {this.props.language}>
                </DefaultAnnotationCard>
            </div>
        </div>
        ));
    }
    chooseLabel = (e)=>{
        //if stageRef is not null, choose bboxs by pairing label and id of bbox
        //bbox'id: 'bbox' + String(i) + '-' + String(bbox['category'])
        //e.target.key is the category
        if(this.props.stageRef){
            //find all bounding boxes
            var bboxs = this.props.stageRef.current.find('.bbox');
            for(var i = 0; i < bboxs.length; i++)
            {
                //highlight qualified bounding boxes (not finished)
                if(bboxs[i].attrs['id'].split('-')[1] === e.target.id)
                {
                    if(bboxs[i].attrs['stroke'] === 'black')
                        bboxs[i].attrs['stroke'] = 'red';
                    else
                        bboxs[i].attrs['stroke'] = 'black';
                }
                else{
                    bboxs[i].attrs['stroke'] = 'black';
                }
            }
            this.props.stageRef.current.getLayers()[0].batchDraw();
            this.setState({curCat: e.target.id, defaultLabelClickCnt: this.state.defaultLabelClickCnt+1});
        }
    }
    createManualLabelList = () => {
        
        //list label according to the category
        return this.props.manualBboxs.map((bbox,i)=>(
        <div key={'manualLabelList-' + String(bbox['id'])}>
            <ListGroup.Item action key={'manualList-'+ String(bbox['id'])} id={String(bbox['id'])} onClick={this.chooseManualBbox}>
                {'Label ' + String(bbox['id'])}
            </ListGroup.Item>
            <ManualAnnotationCard key={'manualAnnotationCard-' + String(bbox['id'])} className={'manualAnnotationCard'} 
            id = {String(bbox['id'])} manualNum={String(bbox['id'])} language = {this.props.language}
            visibleBbox={this.state.curManualBbox} bboxsLength={this.props.manualBboxs.length} 
            clickCnt={this.state.manualLabelClickCnt} stageRef={this.props.stageRef} trRef={this.props.trRef}></ManualAnnotationCard>
        </div>
        ));
    }
    chooseManualBbox = (e) => {
        if(this.props.stageRef){
            this.setState({curManualBbox: e.target.id, manualLabelClickCnt: this.state.manualLabelClickCnt + 1});
            //exit the mode of adding bbox
            this.props.toolCallback({addingBbox: false});
        }
    }
    manualAnn = () => {
        if(this.props.manualMode === false)
        {
            this.props.toolCallback({'manualMode': true});
        }   
        else
        {
            this.props.toolCallback({'manualMode': false});
        }
            
    }
    deleteSelectedLabel = () =>{
        if(this.props.trRef.current.nodes().length !== 0)
        {
            var delete_target = this.props.trRef.current.nodes();
            delete_target[0].destroy();
            this.props.trRef.current.nodes([]);
            this.props.toolCallback({deleteFlag: true});
        }
    }
    render(){
        return (
            <div>
                <button onClick = {() => this.loadData()}>{this.text['load'][this.props.language]}</button>
                <button onClick=  {() => this.manualAnn()}>{this.props.manualMode? this.text['manualOn'][this.props.language]: this.text['manualOff'][this.props.language]}</button>
                {/* Menu for choosing all bounding boxes from a specific category */}
                <div className="defaultLabel">
                <h3>{this.text['labelList'][this.props.language]}</h3>
                <Card style={{left: '3rem', width: '20rem' }} key={'DefaultAnnotationCard'}>
                {
                        this.state.labelList.length? 
                        <ListGroup variant="flush">
                        {this.createDefaultLabelList()}
                        </ListGroup>
                        :
                        <div></div>
                }
                </Card>
                </div>
                <div className="manualLabel">
                <h3>{this.text['manualList'][this.props.language]}</h3>
                <br></br>
                {this.props.manualBboxs.length? <button onClick={ () => this.deleteSelectedLabel()}>{this.text['deleteManualBbox'][this.props.language]}</button>: <div></div>}
                <Card style={{left: '3rem', width: '20rem' }} key={'ManualAnnotationCard'}>
                {
                    this.props.manualBboxs.length? 
                    <div>
                        <ListGroup variant="flush">
                        {this.createManualLabelList()}
                        </ListGroup>
                    </div>
                    :
                    <div></div>
                }
                </Card>
                </div>
            </div>
        );
    }
}

export default Toolbar;