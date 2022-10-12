/* aurel */

import { useState } from "react";

 const LogiqueModale = () => {
     const [revele, setRevele] = useState(false); //- etat d'affichage fenetre
     /* Appel a toggle change l'etat d'affichage */
     function toggle() {
         setRevele(!revele);
     }

     return {
         revele,
         toggle                                                                                                                                                                                                                                                                                                          
     }  
 };

 export default LogiqueModale;