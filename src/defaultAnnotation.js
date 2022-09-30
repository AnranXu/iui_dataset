import { Component } from "react";
import {Container, Row, Col, Card, Form} from 'react-bootstrap';
import React from 'react';
import Slider from '@mui/material/Slider';

class DefaultAnnotationCard extends Component{
    constructor(props){
        super(props);
        this.state = {mainStyle: {position: 'relative', display: 'none'}, importanceValue: '4'};
        this.importanceRef = React.createRef();
        this.intensity = { 1: 'extremely unimportant',
            2: 'moderately unimportant',
            3: 'slightly unimportant',
            4: 'neutral',
            5: 'slightly important',
            6: 'moderately important',
            7: 'extremely important'
        };
        this.marks = [
            {
              value: 1,
              label: 'unimportant',
            },
            {
              value: 2,
              label: '',
            },
            {
              value: 3,
              label: '',
            },
            {
              value: 4,
              label: 'neutral',
            },
            {
                value: 5,
                label: '',
            },
            {
                value: 6,
                label: '',
            },
            {
                value: 7,
                label: 'important',
            },
        ];
    }
    componentDidUpdate(prevProps) {
        //when new click comes
        if(this.props.clickCnt !== prevProps.clickCnt) 
        {
            if(this.props.visibleCat === this.props.category)
            {
                if(this.state.mainStyle.display === 'block')
                    this.setState({mainStyle: {position: 'relative', display: 'none'}});
                else    
                    this.setState({mainStyle: {position: 'relative', display: 'block'}});
            }
            else{
                this.setState({mainStyle: {position: 'relative', display: 'none'}});
            }
        }
    }
    reasonChange = (e)=>{
        var category = e.target.id.split('-')[1];
        var reason_text = document.getElementsByClassName('reasonInput-' + category);
        console.log(category, reason_text);
        if(e.target.value === '5')
        {
            reason_text[0].style.display = "";
            reason_text[0].required = "required";
            reason_text[0].placeholder = "Please input here.";
        }
        else{
            reason_text[0].style.display = "none";
            reason_text[0].required = "";
            reason_text[0].placeholder = "";
        }
    }
    render(){
        return(
            <div style={this.state.mainStyle}>
                <Card style={{ width: '20rem' }} border={'none'} category={this.props.category}>
                <Card.Body>
                    <Card.Title style={{fontSize: 'large'}}><strong>Annotation Box</strong></Card.Title>
                    <Card.Text style={{textAlign: 'left'}}>
                    <strong>What kind of information can this content tell?</strong>
                    </Card.Text>
                    <Form.Select defaultValue={'0'} id = {'reason-'+ this.props.category} onChange={this.reasonChange} required>
                        <option value='0'>Please select one option.</option>
                        <option value='1'>It tells personal identity.</option>
                        <option value='2'>It tells location of shooting.</option>
                        <option value='3'>It tells personal habits.</option>
                        <option value='4'>It tells social circle.</option>
                        <option value='5'>Other things it can tell (Please input below)</option>
                    </Form.Select>
                    <br></br>
                    <input style={{width: '18rem', display: 'none'}} type='text' key={'reasonInput-'+ this.props.category} className={'reasonInput-'+ this.props.category}></input>
                    <Card.Text style={{textAlign: 'left'}}>
                    <strong>How important do you think about this privacy information?</strong>
                    </Card.Text>
                    <Card.Text style={{textAlign: 'center'}} ref={this.importanceRef}>
                    <strong> {this.intensity[this.state.importanceValue]} </strong>
                    </Card.Text>
                    <Slider key = {'importance-' + this.props.category} defaultValue={4}  max={7} min={1} step={1} marks={this.marks} onChange={(e)=>{this.setState({importanceValue: e.target.value})}}/>
                    {/*<input key = {'importance-' + this.props.category} type='range' max={'7'} min={'1'} step={'1'} defaultValue={'4'} onChange={(e)=>{this.setState({importanceValue: e.target.value})}}/> */}
                </Card.Body>
                </Card>
            </div>
        );
    }
}

export default DefaultAnnotationCard;