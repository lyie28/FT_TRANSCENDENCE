/*samantha*/
import axios from 'axios';
import React from 'react';
import {Navigate} from "react-router-dom";
import Logo from '../components/Logo';


class Verify extends React.Component<any, any, any> {
		constructor(props: any) {
			super(props);
			this.state = {value: '', message: true, ok: false};
			this.handleChange = this.handleChange.bind(this);
			this.handleSubmit = this.handleSubmit.bind(this);
		}
	
		
		handleChange(event) {    this.setState({value: event.target.value});  }
		
		handleSubmit(event) {
			event.preventDefault();
						axios.post("http://localhost:3000/verify", this.state, {withCredentials : true })
					.then((response) => {
						if (response.status === 304) {
							this.setState({ok: false, message: false});
						}
						else if (response.status === 200)
						{
							this.setState({ok:true});
						}
					})
					.catch(e => {this.setState({ message: false})});
			}
	
		render() {
			if (this.state.ok === true)
			{
				return (<Navigate to='/Home'/>);
			}
			else
			{
			return (
				
				<div style={{width:"100%", height:"100%", textAlign:'center'}}>
					<div>
					<Logo></Logo>
				</div>
					<div style={{position: "absolute", top:"45%", left:"25%"}}>
				<form  onSubmit={this.handleSubmit}>
					<label>
						Please, check your mail and enter your secret number : <br></br><br></br>
						<input type="text" value={this.state.value} onChange={this.handleChange} />
						</label>
					<input type="submit" value="Send" />
				</form>
				<b>{this.state.message ? '' : 'wrong code, please try again'}</b> 
				</div>
				</div>
			);
		 }
		}
	}

export default Verify
