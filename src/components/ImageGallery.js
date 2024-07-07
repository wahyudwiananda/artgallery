import React, { useState, useEffect } from "react";
import db from "../db";
import "./ImageGallery.css";
import { Button, Container, Navbar, Form, Offcanvas, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ImageGallery = () => {
  const [mediaType, setMediaType] = useState("image");
  const [mediaList, setMediaList] = useState([]);
  const [newMedia, setNewMedia] = useState(null);
  const [description, setDescription] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editMediaId, setEditMediaId] = useState(null);
  const [accessKey, setAccessKey] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const allMedia = await db.media.toArray();
      setMediaList(allMedia);
    } catch (error) {
      console.error("Error loading media:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const mediaData = reader.result;
        setNewMedia({
          type: mediaType,
          data: mediaData,
          description: description,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleMediaTypeChange = (e) => {
    setMediaType(e.target.value);
  };

  const handleAccessKeyChange = (e) => {
    setAccessKey(e.target.value);
  };

  const handleAccessSubmit = () => {
    if (accessKey === "wahyufitapathur") {
      setAccessGranted(true);
    } else {
      alert("Access key is incorrect. Please try again.");
    }
  };

  const uploadMedia = async () => {
    if (!description) return;

    try {
      if (editMode && editMediaId) {
        await db.media.update(editMediaId, {
          description: description,
        });
        setEditMode(false);
        setEditMediaId(null);
      } else {
        // Add new media
        await db.media.add({
          type: mediaType,
          data: newMedia.data,
          description: description,
        });
      }
      // Reset state
      setNewMedia(null);
      setDescription("");
      loadMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
    }
  };

  const startEditMode = (media) => {
    setEditMode(true);
    setEditMediaId(media.id);
    setDescription(media.description);
    setMediaType(media.type);
  };

  const cancelEditMode = () => {
    setEditMode(false);
    setEditMediaId(null);
    setDescription("");
    setNewMedia(null);
  };

  const deleteMedia = async (id) => {
    try {
      await db.media.delete(id);
      loadMedia();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  return (
    <div>
      <Navbar expand="lg">
        <Container>
          <Navbar.Brand className="text-black" href="#home">
            Art Gallery
          </Navbar.Brand>
          <>
            <Button variant="outline-success" onClick={handleShow}>
              {"Admin "}
              <i class="bi bi-list"></i>
            </Button>
            <Offcanvas show={show} onHide={handleClose} placement={"end"}>
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>Administrator</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                {!accessGranted && (
                  <div>
                    <Form.Control type="password" value={accessKey} onChange={handleAccessKeyChange} placeholder="Enter access key" className="mb-2" />
                    <Button onClick={handleAccessSubmit} className="text-end">
                      Enter
                    </Button>
                  </div>
                )}
                {accessGranted && (
                  <div>
                    <Form.Select value={mediaType} onChange={handleMediaTypeChange} className="mb-2">
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                    </Form.Select>
                    <Form.Control type="file" accept={`${mediaType}/*`} onChange={handleFileChange} className="mb-2" />
                    <Form.Control type="text" onChange={handleDescriptionChange} placeholder="Enter description" className="mb-2" />
                    <Button onClick={uploadMedia}>Upload Media</Button>
                  </div>
                )}
              </Offcanvas.Body>
            </Offcanvas>
          </>
        </Container>
      </Navbar>
      <Container className="text-center" style={{ marginTop: "100px", marginBottom: "100px" }}>
        <h1>Medien de Azalea</h1>
      </Container>
      <Container>
        <Row xs={1} md={3} className="g-4" style={{ margin: "auto" }}>
          {mediaList.map((media) => (
            <Col key={media.id} style={{ margin: "auto", padding: "20px" }}>
              {media.type === "image" && (
                <Card style={{ width: "20rem", margin: "auto" }}>
                  <Card.Img variant="top" src={media.data} alt={media.description} />
                  <Card.Body>
                    <Card.Text>{media.description}</Card.Text>
                    {accessGranted && (
                      <div>
                        {editMode && editMediaId === media.id ? (
                          <div>
                            <Form.Control type="text" value={description} onChange={handleDescriptionChange} placeholder="Enter description" className="mb-2" />
                            <Button onClick={uploadMedia} variant="success">
                              <i class="bi bi-floppy-fill"></i> Save
                            </Button>
                            <Button onClick={cancelEditMode} variant="danger" style={{ marginLeft: "10px" }}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button onClick={() => startEditMode(media)} variant="outline-primary">
                              Edit Description
                            </Button>
                            <Button onClick={() => deleteMedia(media.id)} variant="outline-danger" style={{ marginLeft: "10px" }}>
                              <i class="bi bi-trash-fill"></i>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
              {media.type === "video" && (
                <Card style={{ width: "20rem", margin: "auto" }}>
                  <video controls>
                    <source src={media.data} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <Card.Body>
                    <Card.Text>{media.description}</Card.Text>
                    {accessGranted && (
                      <div>
                        {editMode && editMediaId === media.id ? (
                          <div>
                            <Form.Control type="text" value={description} onChange={handleDescriptionChange} placeholder="Enter description" />
                            <Button onClick={uploadMedia} variant="success">
                              <i class="bi bi-floppy-fill"></i> Save
                            </Button>
                            <Button onClick={cancelEditMode} variant="danger" style={{ marginLeft: "10px" }}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button onClick={() => startEditMode(media)} variant="outline-primary">
                              Edit Description
                            </Button>
                            <Button onClick={() => deleteMedia(media.id)} variant="outline-danger" style={{ marginLeft: "10px" }}>
                              <i class="bi bi-trash-fill"></i>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
              {media.type === "audio" && (
                <Card style={{ width: "20rem", margin: "auto", padding: "10px" }}>
                  <audio controls style={{ margin: "auto" }}>
                    <source src={media.data} type="audio/mp3" />
                    Your browser does not support the audio tag.
                  </audio>
                  <Card.Body>
                    <Card.Text>{media.description}</Card.Text>
                    {accessGranted && (
                      <div>
                        {editMode && editMediaId === media.id ? (
                          <div>
                            <Form.Control type="text" value={description} onChange={handleDescriptionChange} placeholder="Enter description" />
                            <Button onClick={uploadMedia} variant="success">
                              <i class="bi bi-floppy-fill"></i> Save
                            </Button>
                            <Button onClick={cancelEditMode} variant="danger" style={{ marginLeft: "10px" }}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button onClick={() => startEditMode(media)} variant="outline-primary">
                              Edit Description
                            </Button>
                            <Button onClick={() => deleteMedia(media.id)} variant="outline-danger" style={{ marginLeft: "10px" }}>
                              <i class="bi bi-trash-fill"></i>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>
          ))}
        </Row>
      </Container>
      <Container className="main-footer">
        <Row className="text-center">
          <p className="mt-3">
            ©2024 Copyright <strong className="text-danger">Medien de Azalea</strong> by{" "}
            <a href="https://www.instagram.com/wahyuananda_05/" target="blank">
              Wahyu Dwi Ananda
            </a>
            . All Rights Reserved
          </p>
        </Row>
      </Container>
    </div>
  );
};

export default ImageGallery;
