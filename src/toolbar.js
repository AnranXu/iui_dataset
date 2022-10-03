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
        this.state = {callbackData: 'sent', bboxs: [], labelList: [], 
        curCat: '', curManualBbox: '', prevCat: '', defaultLabelClickCnt: 0,
        manualLabelClickCnt: 0};
        this.cnt = 0;
    }
    toolCallback = (childData) =>{
        console.log(childData);
        this.setState(childData);
    }
    sendData = () =>{
        this.props.toolCallback({'toolData': this.state.callbackData});
    }
    fetchImage = () =>{
        // get url of image and label from amazon s3. Still on working.
        var s3 = new s3_handler();
        s3.s3_test();
    }
    loadData = () =>{
        /*Maintaining the list of bounding boxes from original dataset and annotators
        The url links to the file that contains all the existing bounding boxes 
        Each line of the file is one annotation
        One annotation has 'bbox': 'category': for generating bounding boxes and getting category
        */
        var ret = {};
        //for testing image change,
        if(this.cnt === 0){
            ret = {imageURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/0c78bb26de5c0090.jpg',
            labelURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/0c78bb26de5c0090_label'};
            this.cnt += 1;
        }
        else{
            ret = {imageURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/0b4d873e11cda01b.jpg',
            labelURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/0b4d873e11cda01b_label'};
        }
        var ori_bboxs = [];
        var label_list = {};
        fetch(ret.labelURL).then( (res) => res.text() ) //read label as text
        .then( (text) => {
            var ori_anns = text.split('\n'); // split it as each row has one annotation
            for(var i = 0; i < ori_anns.length; i++)
            {
                var json = ori_anns[i].replaceAll("\'", "\"");
                var cur_ann = JSON.parse(json); // parse each row as json file
                ori_bboxs.push({'bbox': cur_ann['bbox'], 'category': cur_ann['category'], 
                'width': cur_ann['width'], 'height': cur_ann['height']}); //get bbox (x, y, w, h), width, height of the image (for unknown reasons, the scale of bboxs and real image sometimes are not identical), and category
                //create list of category, we just need to know that this image contain those categories.
                console.log(cur_ann['category']);
                label_list[cur_ann['category']] = 1;
            }
            ret.bboxs = ori_bboxs;
            this.setState({bboxs: ori_bboxs, labelList: Object.keys(label_list)});
        }
        ).then(() => {this.props.toolCallback(ret)})
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    createDefaultLabelList = () => {
        
        //list label according to the category
        return this.state.labelList.map((label,i)=>(
        <div>
            <ListGroup.Item action key={'categoryList-'+label} id={label} onClick={this.chooseLabel}>
                {label}
            </ListGroup.Item>
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
    render(){
        return (
            <div>
                <button onClick = {() => this.sendData()}>Test sending URL</button>
                <button onClick = {() => this.fetchImage()}>Test S3</button>
                <button onClick = {() => this.loadData()}>Test Loading</button>
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
                <Card style={{left: '3rem', width: '20rem' }} key={'ManualAnnotationCard'}>
                {
                    this.props.manualBboxs.length? 
                    <ListGroup variant="flush">
                        {this.createManualLabelList()}
                    </ListGroup>
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