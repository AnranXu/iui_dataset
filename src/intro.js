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
                <input type="radio" value="1" name={'question-' + String(i)} /> Disagree strongly
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
    render(){
        return(
            <div>
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
                            <Card.Title><h3><strong>Task</strong></h3></Card.Title>
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