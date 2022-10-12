/* aurel */
import axios from "axios";
import React from "react";
import { socket } from "./Socket";

//-* Formulaire de modif de profil 

class UserForm2 extends React.Component<any, any, any> {
    constructor(props: any) {
      super(props);
      //-* Valeurs par defaut
      this.state = {
          id: props.user.id,
          login: props.user.login,
          email: props.user.email,
          twoFA: props.user.twoFA,
          toggle: props.toggle,
          ok: true,
          message:false,
          display: "",
        };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    //-* Gestion des champs controles/chgt des valeur 
    handleChange(e) {
        if (e.target.value.length > 15) {
				alert('Login too long. Size max: 15');
				return;
        }
        const name = e.target.name;
        const type = e.target.type;
        const value = type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
          [name]: value,
          display:"",
        });
    }
    handleChangePhoto(e) {
        this.setState({
          photo: e.target.file[-1]
        });
    }
    //-* Envoie du formulaire 
    async handleSubmit(e) {
      e.preventDefault();

    //-* Creation de l'obj a envoyer
    const formUser = {
        id: this.state.id,
        login: this.state.login,
        email: this.state.email,
        twoFA: this.state.twoFA,
    }
    axios.post("http://localhost:3000/users/set", formUser, {withCredentials:true}).then((res) =>{
      if (res.data.bool === false)
      {
        this.setState({ok:false, message:true, display: res.data.msg})
      }
      else{
        socket.emit('changeInfos', {id: this.state.id});
        this.state.toggle();
      }
    })
    .catch(error => {
      if (error.response && error.response.status)
      {
          if (error.response.status === 403)
              window.location.href = "http://localhost:4200/";
          else
              console.log("Error: ", error.response.code, " : ", error.response.message);
      }
      else if (error.message)
          console.log(error.message);
      else
          console.log("unknown error");
    })
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
            <div style={{display:'flex', justifyContent:'center'}}>
                <h2>{this.props.user.login}</h2>                  
            </div>
            <div>
                <label>Login :
                <input type="text" value={this.state.login} onChange={this.handleChange} id="login" name="login" /></label>
            </div>
            <input type="submit" value="Set changes" /><b>{this.state.message ? this.state.display : ''}</b>

        </form>
      );
    }
  }

export default UserForm2