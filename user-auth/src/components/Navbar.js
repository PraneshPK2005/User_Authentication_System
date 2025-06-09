import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Button, Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import '../css/NavbarStyles.css'; 

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
        <Container>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BootstrapNavbar.Brand 
              as={Link} 
              to="/" 
              className="navbar-brand"
            >
              Auth System
            </BootstrapNavbar.Brand>
          </motion.div>
          
          <BootstrapNavbar.Toggle 
            aria-controls="basic-navbar-nav" 
            className="navbar-toggle"
          />
          
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {!isAuthenticated ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Nav.Link 
                      as={Link} 
                      to="/login" 
                      className="nav-link"
                    >
                      Login
                    </Nav.Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Nav.Link 
                      as={Link} 
                      to="/register" 
                      className="nav-link"
                    >
                      Register
                    </Nav.Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Nav.Link 
                      as={Link} 
                      to="/profile" 
                      className="nav-link"
                    >
                      Profile
                    </Nav.Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline-light" 
                      onClick={handleLogout}
                      className="logout-button"
                    >
                      Logout
                    </Button>
                  </motion.div>
                </>
              )}
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </motion.div>
  );
};

export default Navbar;