import {z} from 'zod';


export function AllErrors(errors){

return errors.map((error)=>({
  field: error.path[0];
  message: error.message  
}))


}