/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Tab, Nav, Badge } from '../../../components/ui/tailwindOnly';
import { FaCamera, FaPalette, FaFont, FaImage, FaVideo, FaBullhorn } from "react-icons/fa";

const CompanyBranding = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [brandColors, setBrandColors] = useState({
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#ffc107',
  });

  return (
    <Container fluid className="px-4 py-3">
      <div className="mb-4 flex items-center gap-3">
        <FaPalette className="text-blue-600" size={32} />
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Employer Branding Studio</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Build and showcase your company culture</p>
        </div>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row className="gap-4">
          <Col md={3}>
            <Card className="mb-3 border-0 bg-white shadow-sm dark:bg-slate-800">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex flex-col gap-1 p-2">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">Company Profile</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="media">Media Gallery</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="culture">Culture & Values</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="team">Team Showcase</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="branding">Brand Assets</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="social">Social Media</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Company Profile</h5>
                  </Card.Header>
                  <Card.Body>
                    {/* Profile content would go here */}
                    <p>Company branding profile editor...</p>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="media">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Media Gallery</h5>
                  </Card.Header>
                  <Card.Body>
                    <p>Image and video gallery for company...</p>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default CompanyBranding;


