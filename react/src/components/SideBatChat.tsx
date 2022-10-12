import { ModalWindow } from './ModaleWindow/LogiqueModale2';
import { useState } from 'react';
import AddNav from './AddNav';
import MaterialIcon from 'material-icons-react';
import './css/globalStyle.css'


const SideBarChat = (props) => {

    /* Outils d'affichage de la modale */
    const [revele, setRevele] = useState(false);
    const toggleModal = () => {setRevele(!revele);} 
    /*------*/

    return (
        <div>
           <button className="smallMarginRight" onClick={toggleModal}><MaterialIcon title="Friends - Channels" icon="add_circle" /></button>
            <ModalWindow revele={revele} setRevele={toggleModal}>
                <AddNav user={props.user} toggleAddNav={setRevele}/>
            </ModalWindow>
        </div>
    );
};

export default SideBarChat;