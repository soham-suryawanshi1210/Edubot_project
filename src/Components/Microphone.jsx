import React from 'react';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import { FaMicrophone } from 'react-icons/fa';

export default function Microphone() {

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition()

      const handleMicClick = () => {
    console.log('Mic button clicked for voice input!');
    // Add voice recording functionality here
  };

  if(!browserSupportsSpeechRecognition){

  }

  

  return (
         
            <button className='cs-button--mic'
            onClick={handleMicClick}>
            <FaMicrophone size={22} />
          </button>
   
  )
}

