import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SELFURL } from '../const';
import axios from 'axios';
import { toast } from 'react-toastify';

const App = () => {
    const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
        try {
            const apiUrl = `${SELFURL}login`;
            let search_data = await axios.post(apiUrl, values);
            console.log(search_data);
            if (search_data.status === 200) {
                await localStorage.setItem('token', search_data.data.token);
                toast.success(search_data.data.message);
                navigate("/")
            } else {
                toast.success(search_data.response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }  
    },
  });

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100 hero-section">
        <div className="col-md-4">
          <form className="p-4 border rounded" onSubmit={formik.handleSubmit}>
            <h2 className="text-center mb-4">Login</h2>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="text"
                className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback">{formik.errors.email}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="invalid-feedback">{formik.errors.password}</div>
              )}
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
