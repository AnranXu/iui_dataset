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
    sharingChange = (e)=>{
        var category = e.target.id.split('-')[1];
        var sharing_text = document.getElementsByClassName('sharingInput-' + category);
        if(e.target.value === '5')
        {
            sharing_text[0].style.display = "";
            sharing_text[0].required = "required";
            sharing_text[0].placeholder = "Please input here.";
        }
        else{
            sharing_text[0].style.display = "none";
            sharing_text[0].required = "";
            sharing_text[0].placeholder = "";
        }
    }
    render(){
        return(
            <div style={this.state.mainStyle}>
                <Card style={{ width: '20rem' }} border={'none'} category={this.props.category}>
                <Card.Body>
                    <Card.Title style={{fontSize: 'large'}}><strong>Annotation Box</strong></Card.Title>
                    <Card.Text style={{textAlign: 'left'}}>
                    <strong>Assuming you want to seek privacy of the photo owner, what kind of information can this content tell?</strong>
                    </Card.Text>
                    <Form.Select defaultValue={'0'} key={'reason-'+ this.props.category} 
                    id={'reason-'+ this.props.category} onChange={this.reasonChange} required>
                        <option value='0'>Please select one option.</option>
                        <option value='1'>It tells personal identity.</option>
                        <option value='2'>It tells location of shooting.</option>
                        <option value='3'>It tells personal habits.</option>
                        <option value='4'>It tells social circle.</option>
                        <option value='5'>Other things it can tell (Please input below)</option>
                    </Form.Select>
                    <br></br>
                    <input style={{width: '18rem', display: 'none'}} type='text' key={'reasonInput-'+ this.props.category} 
                    id={'reasonInput-'+ this.props.category} 
                    className={'reasonInput-'+ this.props.category}></input>
                    <Card.Text style={{textAlign: 'left'}}>
                    <strong>How important do you think about this privacy information for the photo owner?</strong>
                    </Card.Text>
                    <Card.Text style={{textAlign: 'center'}} ref={this.importanceRef}>
                    <strong> {this.intensity[this.state.importanceValue]} </strong>
                    </Card.Text>
                    <Slider required style ={{width: '15rem'}} key={'importance-' + this.props.category} 
                    defaultValue={4}  max={7} min={1} step={1} 
                    marks={this.marks} onChange={(e, val)=>{
                        this.setState({importanceValue: val}); 
                        var input = document.getElementById('importance-' + this.props.category);
                        input.value = val;
                        }}/>
                    <input defaultValue={4} id={'importance-' + this.props.category} style={{display: 'none'}}></input>
                    {/*<input key = {'importance-' + this.props.category} type='range' max={'7'} min={'1'} step={'1'} defaultValue={'4'} onChange={(e)=>{this.setState({importanceValue: e.target.value})}}/> */}
                    <Card.Text style={{textAlign: 'left'}}>
                        <strong>Assuming you are the photo owner, to what extent would you share this content at most?</strong>
                    </Card.Text>
                    <Form.Select defaultValue={'0'} key={'sharing-'+ this.props.category}
                    id={'sharing-'+ this.props.category} onChange={this.sharingChange} required>
                        <option value='0'>Please select one option.</option>
                        <option value='1'>I won't share it</option>
                        <option value='2'>Family or friend</option>
                        <option value='3'>Public</option>
                        <option value='4'>Broadcast programme</option>
                        <option value='5'>Other recipients (Please input below)</option>
                    </Form.Select>
                    <br></br>
                    <input style={{width: '18rem', display: 'none'}} type='text' key={'sharingInput-'+ this.props.category} 
                    id={'sharingInput-'+ this.props.category}  className={'sharingInput-'+ this.props.category}></input>
                </Card.Body>
                </Card>
            </div>
        );
    }
}

export default DefaultAnnotationCard;