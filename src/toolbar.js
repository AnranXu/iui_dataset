import { Component } from "react";
//s3 uploader to our Amazon S3 storage for saving images. 
//I am not familar with uploading data to our own backend server by using secure ways (I only know ways like jQuery).
//Currently, I am not planning to deploy some backend intelligent cut properties so we do not need backend computations. 
//Also, always setting a server in Google/Amazon will cost us much money. So, I prefer using Amazon S3 to deploy our backend data transfer. 
import s3_handler from "./library/s3uploader.js";
import {Container, Row, Col, Card, ListGroup} from 'react-bootstrap';
import DefaultAnnotationCard from './defaultAnnotation.js';
import ManualAnnotationCard from "./manualAnnotation.js";
import { experimentalStyled } from "@mui/material";
class Toolbar extends Component{
	constructor(props)
	{
        super(props);
        this.state = {callbackData: 'sent', bboxs: [], labelList: [], 
        curCat: '', curManualBbox: '', prevCat: '', defaultLabelClickCnt: 0,
        manualLabelClickCnt: 0};
    }
    toolCallback = (childData) =>{
        console.log(childData);
        this.setState(childData);
    }
    sendData = () =>{
        this.props.toolCallback({'toolData': this.state.callbackData});
    }
    uploadAnnotation = () =>{

    }
    updateRecord = (task_record) =>{
        var s3 = new s3_handler();
        s3.updateRecord(task_record);
    }
    readURL = (image_URL, label_URL) => {
        var ori_bboxs = [];
        var label_list = {};
        fetch(label_URL).then( (res) => res.text() ) //read new label as text
        .then( (text) => {
            var ori_anns = text.split('\n'); // split it as each row has one annotation
            for(var i = 0; i < ori_anns.length; i++)
            {
                var json = ori_anns[i].replaceAll("\'", "\"");
                var cur_ann = JSON.parse(json); // parse each row as json file
                console.log(cur_ann);
                ori_bboxs.push({'bbox': cur_ann['bbox'], 'category': cur_ann['category'], 
                'width': cur_ann['width'], 'height': cur_ann['height']}); //get bbox (x, y, w, h), width, height of the image (for unknown reasons, the scale of bboxs and real image sometimes are not identical), and category
                //create list of category, we just need to know that this image contain those categories.
                console.log(cur_ann['category']);
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
        var ret = {};
        var worker_id = 'test5';
        var prefix = 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/';
        var task_record_URL = 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/task_record.json';
        var image_URL = '';
        var label_URL = '';
        //for testing image change,
        fetch(task_record_URL).then((res) => res.text()).then( (text) =>{
            
            text = text.replaceAll("\'", "\"");
            console.log(text);
            var task_record = JSON.parse(text); // parse each row as json file
            //if this worker is back to his/her work
            var cur_progress = 0;
            var task_num = '0';
            if(worker_id in task_record['worker_record'])
            {
                cur_progress = task_record['worker_record'][worker_id]['progress'];
                task_num = task_record['worker_record'][worker_id]['task_num'];
            }
            //create new record and move old record
            else{
                task_record['worker_record'][worker_id] = {};
                task_record['worker_record'][worker_id]['progress'] = 0;
                task_num = task_record['cur_progess'];
                task_record['worker_record'][worker_id]['task_num'] = task_record['cur_progess'];
                task_record['cur_progess'] = String(parseInt(task_record['cur_progess']) + 1);
            }
            if(cur_progress >= 10)
            {
                alert('You have finished your task, thank you!');
                return;
            }
            var image_ID = task_record[task_num]['img_list'][cur_progress];
            image_URL = prefix + 'all_img/'+ image_ID + '.jpg';
            label_URL = prefix + 'all_label/'+ image_ID + '_label';
            task_record['worker_record'][worker_id]['progress'] += 1; 
            this.uploadAnnotation();
            this.updateRecord(task_record);
        }).then(() => {
            console.log(image_URL);
            console.log(label_URL);
            this.readURL(image_URL, label_URL)
        });
       
    }
    createDefaultLabelList = () => {
        
        //list label according to the category
        return this.state.labelList.map((label,i)=>(
        <div>
            <Container>
				<Row>
                    <Col md={8}>
                        <ListGroup.Item action key={'categoryList-'+label} id={label} onClick={this.chooseLabel}>
                            {label}
                        </ListGroup.Item>
                    </Col>
                    <Col md={4}>
                        <button>
                            Not Privacy
                        </button>
                    </Col>
                    
                </Row>
            </Container>
            
        <DefaultAnnotationCard key={'annotationCard-'+label} visibleCat={this.state.curCat} category = {label} clickCnt={this.state.defaultLabelClickCnt}></DefaultAnnotationCard>
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
        <div>
            <ListGroup.Item action key={'manualList-'+ String(bbox['id'])} id={String(bbox['id'])} onClick={this.chooseManualBbox}>
                {'Label ' + String(bbox['id'])}
            </ListGroup.Item>
        <ManualAnnotationCard key={'manualAnnotationCard-' + String(bbox['id'])} id = {String(bbox['id'])} manualNum={String(bbox['id'])} 
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
                <button onClick = {() => this.loadData()}>Loading the next image</button>
                <button onClick=  {() => this.manualAnn()}>{this.props.manualMode? 'Stop Creating Bounding Box': 'Create Bounding Box'}</button>
                {/* Menu for choosing all bounding boxes from a specific category */}
                <div className="defaultLabel">
                Label List
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
                Manual Label
                <br></br>
                {this.props.manualBboxs.length? <button onClick={ () => this.deleteSelectedLabel()}>Delete selected label</button>: <div></div>}
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