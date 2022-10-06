import {Container, Row, Col, Card, Form, Button, ButtonGroup} from 'react-bootstrap';
import { Component } from "react";
import React from 'react';
import s3_handler from "./library/s3uploader.js";
import $ from "jquery";
import './intro.css';

class Intro extends Component{
    constructor(props){
        super(props);
        this.state = {gender: ''};
        this.bigfiveRef = [];
        this.bigfiveAns = new Array(10).fill('0');
        this.gender = '';
        this.name = React.createRef();
        this.age = React.createRef();
        this.nationality = React.createRef();
        this.workerId = React.createRef();
        for(var i = 0; i < 10; i++)
            this.bigfiveRef[i] = React.createRef();
    }
    submit = () =>{
        var ifFinished = true;
        //check name
        if(this.name.current.value == '')
        {
            console.log('false');
            ifFinished = false;
        }
            
        //check age
        if(this.age.current.value == '')
        {
            console.log('false');
            ifFinished = false;
        }
            
        //check gender
        if(this.gender === '')
        {
            ifFinished = false;
            console.log('false');
        }
            
        // check nationality
        if(this.nationality.current.value == '')
        {
            ifFinished = false;
            console.log('false');
        }
            
        // check workerid
        if(this.workerId.current.value == '')
        {
            ifFinished = false;
            console.log('false');
        }
            
        // check bigfive
        for(var i = 0; i < 10; i++)
        {
            if(this.bigfiveAns[i] === '0')
            {
                ifFinished = false;
                console.log('break');
                break;
            }
        }
        if(ifFinished)
        {
            console.log('uploading worker info');
            var anws = {'name': this.name.current.value, 'age': this.age.current.value,
            'gender': this.gender, 'nationality': this.nationality.current.value,
            'workerId': this.workerId.current.value, 'bigfives': this.bigfiveAns};
            var s3 = new s3_handler();
            s3.updateQuestionnaire(anws, this.workerId.current.value);
            this.props.toolCallback({page: 'task', workerId: this.workerId.current.value});
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        }  
        else{
            alert('Please fill out all questions');
        }
    }
    selectGender = (e) =>{
        this.gender = e.target.value;
    }
    generateBigfive = () =>{
        var questions = ['Q1: I see myself as someone who is reserved.',
        'Q2: I see myself as someone who is generally trusting.',
        'Q3: I see myself as someone who tends to be lazy.',
        'Q4: I see myself as someone who is relaxed‚ handles stress well.',
        'Q5: I see myself as someone who has few artistic interests.',
        'Q6: I see myself as someone who is outgoing‚ sociable.',
        'Q7: I see myself as someone who tends to find fault with others.',
        'Q8: I see myself as someone who does a thorough job.',
        'Q9: I see myself as someone who gets nervous easily.',
        'Q10: I see myself as someone who has an active imagination.'];

        return questions.map((question,i)=>(
        <div>
            <Card.Text style={{ textAlign: 'left'}}><h4>{question}</h4></Card.Text>
            <div defaultValue={'0'} key = {'question-' + String(i)} ref={this.bigfiveRef[i]} className={'radioButton'} onChange={this.getBigfive}>
                <input style = {{ height: '2em'}}type="radio" value="1" name={'question-' + String(i)} /> Disagree strongly
                <input type="radio" value="2" name={'question-' + String(i)} /> Disagree a little
                <input type="radio" value="3" name={'question-' + String(i)} /> Neither agree or disagree
                <input type="radio" value="4" name={'question-' + String(i)} /> Agree a little
                <input type="radio" value="5" name={'question-' + String(i)} /> Agree strongly
            </div>
            <br></br>
        </div>
        ));
    }
    getBigfive = (e)=>{
        
        this.bigfiveAns[parseInt(e.target.name.split('-')[1])] = e.target.value;
        console.log(this.bigfiveAns);
    }
    taskIntro = (e) =>{
        var loading = require('./img/demo.png');
        var finishPop = require('./img/finish.png');
        return(
            <div>
                <Card.Text text={'dark'}>
                    <h3>
                    Your task is to annotate all privacy-threatening content in given images (Normally there are 10 images). 
                    <br></br>
                    <br></br>
                    Please first input your basic information and fill out a small questionnaire. 
                    <br></br>
                    <br></br>
                    After you click the bottommost button, you will go to the annotation interface.
                    
                    </h3>
                </Card.Text>
                <Card.Title><h1><strong>How to use the interface</strong></h1></Card.Title>
                <Card.Text>
                    <h3>
                        Click the button '<strong>Loading the next image</strong>' to get the next image you need to annotate.
                        <br></br>
                        <br></br>
                        You will see a list of labels after you load an image. 
                        <br></br>
                        <br></br>
                        You need to click each of them to answer if you regard this content as <strong>privacy-threatening</strong>.
                        <br></br>
                        <br></br>
                        If you think this content is privacy-threatening, please answer the questions folded in the label.
                        <br></br>
                        <br></br>
                        If you think this content is not privacy-threatening, please check the 'not privacy' box to <strong>skip the annotation</strong>.
                        <br></br>
                        <br></br>
                        You may add extra bounding boxes by the button 'Create bounding box' if you find something privacy-threatening but <strong>does not be given in the default bounding boxes</strong>. 
                        <br></br>
                        <br></br>
                        After you click it, please move your mouse to the image and create a bounding box by mouse down and mouse up.
                        <br></br>
                        <br></br>
                        Please also tell us why you create extra bounding boxes.
                        <br></br>
                        <br></br>
                        Once you finish all the annotations, please click '<strong>Loading the next image</strong>' to annotate the next image.
                        <br></br>
                        <br></br>
                        The image below is an example of the interface.
                        <br></br>
                        <br></br>
                        <img src = {loading} style = {{maxHeight: '100%', maxWidth: '100%'}}/>
                        <br></br>
                        <br></br>   
                    </h3>
                </Card.Text>
                <Card.Title><h1><strong>How to know if I finish the task?</strong></h1></Card.Title>
                <Card.Text>
                    <h3>
                        If you finish all the annotation tasks, the interface will pop up a piece of information.
                        <br></br>
                        <br></br>
                        <img src = {finishPop} style = {{maxHeight: '100%', maxWidth: '100%'}}/>
                        <br></br>
                        <br></br>
                        Then, you may leave the interface, submit your status on the platform, and get approved. 
                        <br></br>
                        <br></br>
                        If you want to leave the interface before finishing all tasks, please input the same info (especially <strong>Worker's ID</strong>) on this page and you may resume your task stage.
                    </h3>
                </Card.Text>
            </div>
            
        );
    }
    render(){
        return(
            <div style={this.props.display?{display: 'block'}:{display: 'none'}}>
                <Container>
                    <Row>
                        <Col md ={1}>
                        </Col>
                        <Col md={11}>
                        <Card style={{ maxWidth: '80%'}} border={'dark'}>
                        <Card.Header  style={{ textAlign: 'left'}}>
                            <h2><strong>Instruction</strong></h2>
                        </Card.Header>
                        <Card.Body text={'dark'}  style={{ textAlign: 'left'}}>
                            <Card.Title><h1><strong>Task</strong></h1></Card.Title>
                            {this.taskIntro()}
                        </Card.Body>
                        <br></br>
                        <span style={{textAlign: 'left'}}><h3>Name:</h3></span>
                        <input type="text" id="particpant-name" ref={this.name}/><br/>
                        <span  style={{ textAlign: 'left'}}><h3>Age (Your age should be from 20 to 70):</h3></span>
                        <input type="text" id="particpant-age" ref={this.age}/><br/>
                        <span  style={{ textAlign: 'left'}}><h3>Gender:</h3></span>
                        <div id ={'gender'} onChange={this.selectGender}>
                            <input type="radio" value="Male" name="gender" /> Male
                            <input type="radio" value="Female" name="gender" /> Female
                            <input type="radio" value="Other" name="gender" /> Prefer not to mention
                        </div>
                        <span  style={{ textAlign: 'left'}}><h3>Nationality:</h3></span>
                        <input type="text" id="particpant-nationality" ref={this.nationality} /><br/>
                        <span  style={{ textAlign: 'left'}}><h3>Worker's ID:</h3></span>
                        <input type="text" id={"particpant-workerid"} ref={this.workerId} /><br/>
                        <br></br>
                        <Card.Text style={{ textAlign: 'left'}}>
                            <h3>Please answer the following questions:</h3>
                        </Card.Text>
                        {this.generateBigfive()}
                        <Card.Footer onClick = {this.submit} style={{cursor: 'pointer'}}>
                            <h2 style={{textAlign: "center"}}>I fully understood the study and want to do this task with my consent.</h2>
                            <h2 style={{textAlign: "center"}}>(You may back to read the instruction later if you need.)</h2>
                        </Card.Footer>
                        </Card>
                        </Col>
                    </Row>
                </Container>

            </div>
        );
    }
}

export default Intro;