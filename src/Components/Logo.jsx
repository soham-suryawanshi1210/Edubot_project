import React from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import {Link} from 'react-router-dom';

export default function Logo({ collapsed }) {
  
  return (
    <div className="logo bot-icon">
      <div className="logo-icon bot-icon">
       <Link to="/"> <FaGraduationCap style={{ color: 'white'}} size={36} /></Link>
        {!collapsed && <Link to="/"> <p>  EDUBOT </p> </Link>} 
      </div>
    </div>
  );
}