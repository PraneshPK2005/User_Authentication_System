import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/ProfileStyles.css';

const profileSchema = yup.object().shape({
  age: yup.number()
    .typeError('Age must be a number')
    .positive('Age must be positive')
    .integer('Age must be an integer'),
  dob: yup.date()
    .typeError('Invalid date')
    .required('Date of Birth is required'),
  contact: yup.string()
    .matches(/^[0-9]{10}$/, 'Contact must be a 10-digit number')
});

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);

  const formik = useFormik({
    initialValues: {
      age: '',
      dob: '',
      contact: ''
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:5000/profile', values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
        setIsNewProfile(false);
        toast.success('Profile updated successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setShowModal(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);

        if (!response.data.profile) {
          setIsNewProfile(true);
          setShowModal(true);
          formik.setValues({
            age: '',
            dob: '',
            contact: ''
          });
        } else {
          setProfile(response.data.profile);
          setIsNewProfile(false);
          formik.setValues({
            age: response.data.profile.age || '',
            dob: response.data.profile.dob 
              ? new Date(response.data.profile.dob).toISOString().split('T')[0] 
              : '',
            contact: response.data.profile.contact || ''
          });
        }

      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch profile', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (profileLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="d-flex justify-content-center align-items-center loading-container"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { 
              repeat: Infinity, 
              duration: 1, 
              ease: "linear" 
            },
            scale: {
              repeat: Infinity,
              duration: 1,
              repeatType: "reverse"
            }
          }}
        >
          <Spinner animation="border" variant="primary" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mt-4 profile-container"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="profile-card shadow-lg">
          <Card.Body>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card.Title className="text-center mb-4 profile-title">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  Profile
                </motion.span>
              </Card.Title>
            </motion.div>
            
            {user && (
              <motion.div 
                className="mb-4 user-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h5 className="section-title">Account Information</h5>
                <div className="info-item">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{user.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {profile ? (
                <motion.div
                  key="profile-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mb-4 profile-details"
                >
                  <h5 className="section-title">Profile Details</h5>
                  <div className="info-item">
                    <span className="info-label">Age:</span>
                    <span className="info-value">{profile.age || 'Not set'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date of Birth:</span>
                    <span className="info-value">
                      {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Contact:</span>
                    <span className="info-value">{profile.contact || 'Not set'}</span>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3"
                  >
                    <Button 
                      variant="primary" 
                      onClick={() => setShowModal(true)}
                      className="profile-button"
                    >
                      Update Profile
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mb-4"
                >
                  <motion.div 
                    className="alert alert-info"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    Please complete your profile information
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="primary" 
                      onClick={() => setShowModal(true)}
                      className="profile-button"
                    >
                      Complete Profile
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Profile Update Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal 
            show={showModal} 
            onHide={() => isNewProfile ? null : setShowModal(false)} 
            backdrop={isNewProfile ? 'static' : true}
            centered
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Modal.Header closeButton={!isNewProfile} className="modal-header">
                <Modal.Title>{isNewProfile ? 'Complete Your Profile' : 'Update Profile'}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={formik.handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="number"
                        name="age"
                        placeholder="Enter age"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.age}
                        isInvalid={formik.touched.age && !!formik.errors.age}
                        className="form-input"
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.age}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.dob}
                        isInvalid={formik.touched.dob && !!formik.errors.dob}
                        className="form-input"
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.dob}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact"
                        placeholder="Enter contact number"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.contact}
                        isInvalid={formik.touched.contact && !!formik.errors.contact}
                        className="form-input"
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.contact}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </motion.div>

                  <div className="d-flex justify-content-end">
                    {!isNewProfile && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="secondary" 
                          onClick={() => setShowModal(false)}
                          className="me-2 modal-button"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                        className="modal-button"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : 'Save Profile'}
                      </Button>
                    </motion.div>
                  </div>
                </Form>
              </Modal.Body>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;