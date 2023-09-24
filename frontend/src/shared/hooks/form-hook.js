import { useCallback, useReducer } from 'react'
// import { act } from 'react-dom/test-utils';

const formReducer = (state, action) => {
  switch (action.type) {
    case 'INPUT_CHANGE':
      const updatedInputs = {
        ...state.inputs,
        [action.inputId]: { value: action.value, isValid: action.isValid }
      };

      let formIsValid = true;
      for (const inputId in updatedInputs) {
        formIsValid = formIsValid && updatedInputs[inputId].isValid;
      }

      return {
        ...state,
        inputs: updatedInputs,
        isValid: formIsValid
      };
      case 'SET_DATA':
        return {
          inputs:action.inputs,
          isValid:action.formIsValid
        }

      
    default:
      return state;
  }
};

export const useForm = (initialInputs,initialFormValidity) => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs:initialInputs,
    isValid: initialFormValidity
  });


  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({ 
      type: "INPUT_CHANGE", 
      value: value, 
      isValid: isValid, 
      inputId: id });
  }, [dispatch]);

  const setFormData=useCallback((inputData,formValidity)=>{
    dispatch({
      type:'SET_DATA',
      inputs:inputData,
      formIsValid:formValidity

    })

  },[])

  return [formState,inputHandler,setFormData]
  
}

