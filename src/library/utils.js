class utils{
    constructor()
    {
        this.ann = []
    }
    annToS3 = ()=>{
        // read current 

    }
    get_next_url = () =>{
        this.setState({imageURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/21879.jpg',
                        labelURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/21879_label'}, 
                        () => {this.load_bbox(this.state.labelURL); console.log(this.stageRef.current.find('.bbox'));});
    }
}

export default Uint32List;