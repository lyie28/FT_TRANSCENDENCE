import { useState } from "react";
import AddFriend from "./AddFriend";
import AddChannel from "./AddChannel";
import './css/globalStyle.css'


/* Switch entre AddFriend ou AddChannels */
 const AddNav = (props) => {
	 const [reveleFriend, setReveleFriend] = useState(true); //- etat d'affichage fenetre

	  const  switchToFriend = () => {
		  setReveleFriend(true);
	  }

	  const  switchToChannel = () => {
		  setReveleFriend(false);
	  }  

     return (
         <div>
            <ul><li className={`${!reveleFriend && "activeTab"}`}>
               <button onClick={switchToChannel}>Channels</button>
               </li><li className={`${reveleFriend && "activeTab"}`} >
               <button onClick={switchToFriend}>Friends</button>
               </li></ul>
            {reveleFriend ? <h2>Add friend</h2> : <h2>Add channel</h2>}
            <div style={{display:'flex', justifyContent:'center', width:'100%'}}></div> 
            {reveleFriend ? <AddFriend user={props.user} toggleAddNav={props.toggleAddNav}/> : <AddChannel user={props.user} />}
        </div>    
     );  
 }

 export default AddNav;
