import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signup } from '../../Slices/AuthSlice.js';
import toast from 'react-hot-toast';
import './Register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate=useNavigate()
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    county: '',
    postcode: '',
  });

  const [avatar, setAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };
   
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    if (avatar) {
      formDataToSend.append('avatar', avatar);
    }

    try {
      const result = await dispatch(signup(formDataToSend)).unwrap();
      if (result) {
        console.log('REGISTER SUCCESS!!!');
        toast.success('VERIFY NOW!');
        navigate('/verify')
      }
    } catch (err) {
      console.error('REGISTER ERROR:', err);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <form onSubmit={handleRegister} className="register-form">
        {Object.keys(formData).map((key) => (
          <div className="form-group" key={key}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <input
              type={key === 'password' ? 'password' : 'text'}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={`Enter your ${key}`}
              required
              className="register-input"
            />
          </div>
        ))}
        <div className="form-group">
          <label>Avatar</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
            className="register-input"
          />
        </div>
        <button type="submit" className="register-button" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
