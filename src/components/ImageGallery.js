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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchEmpty, setSearchEmpty] = useState(false); // State untuk menandai pencarian kosong

  const handleSearchChange = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    try {
      if (term.trim() === "") {
        setSearchResults([]);
        setSearchEmpty(false);
      } else {
        const results = await db.media.filter((media) => media.description.toLowerCase().includes(term.toLowerCase())).toArray();

        setSearchResults(results);
        setSearchEmpty(results.length === 0); // Set state searchEmpty jika hasil pencarian kosong
      }
    } catch (error) {
      console.error("Error searching media:", error);
    }
  };

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
        await db.media.add({
          type: mediaType,
          data: newMedia.data,
          description: description,
        });
      }

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
            Classic Art Gallery
          </Navbar.Brand>
          <Form className="my-4 ms-auto me-2">
            <Form.Control type="text" placeholder="Search here..." value={searchTerm} onChange={handleSearchChange} />
          </Form>
          <>
            <Button variant="outline-success" onClick={handleShow}>
              {"Admin "}
              <i className="bi bi-list"></i>
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
      <Container className="text-center" style={{ marginTop: "100px", marginBottom: "100px", maxWidth: "600px" }}>
        <h1 className="colored-text">
          <span>Medien</span> <span>de</span> <span>Azalea</span>
        </h1>
        <h4 className="sub-title">A Timeless Journey Through Classic Art and Music</h4>
        <p>Rediscover the essence of timeless classics, where every artwork, musical note, and cinematic moment invites you to explore, reflect, and appreciate the enduring beauty of human creativity.</p>
        <hr />
      </Container>
      <Container>
        {searchTerm !== "" && <h4 className="text-center mb-4">{searchEmpty ? "Sorry, we don't have that..." : "Search Results:"}</h4>}
        <Row xs={1} md={3} className="g-4" style={{ margin: "auto" }}>
          {searchResults.map((media) => (
            <Col key={media.id} style={{ margin: "auto", padding: "20px" }}>
              <Card style={{ width: "20rem", margin: "auto" }}>
                {media.type === "image" && <Card.Img variant="top" src={media.data} alt={media.description} />}
                {media.type === "video" && (
                  <video controls>
                    <source src={media.data} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                {media.type === "audio" && (
                  <audio controls style={{ margin: "auto" }}>
                    <source src={media.data} type="audio/mp3" />
                    Your browser does not support the audio tag.
                  </audio>
                )}
                <Card.Body>
                  <Card.Text>{media.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {searchTerm === "" && (
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
                                <i className="bi bi-floppy-fill"></i> Save
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
                                <i className="bi bi-trash-fill"></i>
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
                                <i className="bi bi-floppy-fill"></i> Save
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
                                <i className="bi bi-trash-fill"></i>
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
                                <i className="bi bi-floppy-fill"></i> Save
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
                                <i className="bi bi-trash-fill"></i>
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
        )}
        <hr />
        <Container>
          <Row className="text-center">
            <p>
              ©2024 Copyright <strong className="text-danger">Medien de Azalea</strong>. All Rights Reserved
            </p>
          </Row>
        </Container>
      </Container>
    </div>
  );
};

export default ImageGallery;
