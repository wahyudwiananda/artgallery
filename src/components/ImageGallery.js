import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button, Container, Navbar, Form, Offcanvas, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ImageGallery.css";

const supabaseUrl = "https://jipjrmvxowvhnitvgley.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcGpybXZ4b3d2aG5pdHZnbGV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTMwNjcyMCwiZXhwIjoyMDM2ODgyNzIwfQ.X7J-qlG0ty9enf3MCLueAdiZi7nzC_H4hwUiwYph3xk";
const supabase = createClient(supabaseUrl, supabaseKey);

const ImageGallery = () => {
  const [mediaList, setMediaList] = useState([]);
  const [mediaType, setMediaType] = useState("image");
  const [newMedia, setNewMedia] = useState(null);
  const [description, setDescription] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editMediaId, setEditMediaId] = useState(null);
  const [accessKey, setAccessKey] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMediaType, setSelectedMediaType] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSearchChange = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    try {
      if (term.trim() === "") {
        setSearchResults([]);
      } else {
        const { data, error } = await supabase.from("media_items").select("*").filter("description", "ilike", `%${term}%`);

        if (error) {
          throw error;
        }

        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching media:", error.message);
    }
  };

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase.from("media_items").select("*");

      if (error) {
        throw error;
      }

      setMediaList(data);
    } catch (error) {
      console.error("Error loading media:", error.message);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simpan informasi file untuk digunakan saat upload
      setNewMedia({
        file: file,
        type: mediaType,
        description: description,
      });
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
    try {
      if (editMode && editMediaId) {
        // Update existing media description
        const { error } = await supabase
          .from("media_items")
          .update({
            description: description,
          })
          .eq("id", editMediaId);

        if (error) {
          throw error;
        }

        setEditMode(false);
        setEditMediaId(null);
        setDescription("");
        loadMedia();
        alert("Description updated successfully!");
      } else {
        // Upload new media
        if (!description || !newMedia) return;

        const { error: uploadError } = await supabase.storage.from("ArtGallery").upload(newMedia.file.name, newMedia.file, {
          contentType: newMedia.file.type,
        });

        if (uploadError) {
          throw uploadError;
        }

        const { error } = await supabase.from("media_items").insert([
          {
            type: newMedia.type,
            url: `https://jipjrmvxowvhnitvgley.supabase.co/storage/v1/object/public/ArtGallery/${newMedia.file.name}`,
            description: description,
            original_filename: newMedia.file.name,
          },
        ]);

        if (error) {
          throw error;
        }

        setNewMedia(null);
        setDescription("");
        loadMedia();
        alert("Upload Success!");
      }
    } catch (error) {
      console.error("Error uploading media:", error.message);
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
      const { error } = await supabase.from("media_items").delete().eq("id", id);

      if (error) {
        throw error;
      }

      loadMedia();
    } catch (error) {
      console.error("Error deleting media:", error.message);
    }
  };

  const filterMediaByType = (type) => {
    setSelectedMediaType(type);
    setSelectedFilter(type);
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const displayedMedia = searchTerm !== "" ? searchResults : mediaList.filter((media) => selectedMediaType === "all" || media.type === selectedMediaType);

  return (
    <div>
      <Navbar expand="lg" fixed="top" bg="light" style={{ height: "60px" }}>
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
                    <Button onClick={handleAccessSubmit} className="text-end" variant="success">
                      Sign In
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
                    <Form.Control type="file" accept={mediaType === "image" ? "image/*" : mediaType === "video" ? "video/*" : "audio/*"} onChange={handleFileChange} className="mb-2" />
                    <Form.Control type="text" onChange={handleDescriptionChange} placeholder="Enter description" className="mb-2" />
                    <Button onClick={uploadMedia}>Upload Media</Button>
                    <Button onClick={reloadPage} variant="danger" style={{ marginLeft: "10px" }}>
                      Sign Out
                    </Button>
                  </div>
                )}
              </Offcanvas.Body>
            </Offcanvas>
          </>
        </Container>
      </Navbar>
      <Container data-aos="fade-down" className="text-center" style={{ marginTop: "200px", marginBottom: "100px", maxWidth: "600px" }}>
        <h1 className="colored-text">
          <span>Medien</span> <span>de</span> <span>Azalea</span>
        </h1>
        <h4 className="sub-title">A Timeless Journey Through Classic Art and Music</h4>
        <p>Rediscover the essence of timeless classics, where every artwork, musical note, and cinematic moment invites you to explore, reflect, and appreciate the enduring beauty of human creativity.</p>
        <hr />
      </Container>
      <Container data-aos="fade" className="text-center mb-5">
        <Button className="me-2" variant={selectedFilter === "all" ? "secondary" : "outline-secondary"} onClick={() => filterMediaByType("all")}>
          All
        </Button>
        <Button className="me-2" variant={selectedFilter === "image" ? "primary" : "outline-primary"} onClick={() => filterMediaByType("image")}>
          Painting
        </Button>
        <Button className="me-2" variant={selectedFilter === "video" ? "success" : "outline-success"} onClick={() => filterMediaByType("video")}>
          Video
        </Button>
        <Button className="me-2" variant={selectedFilter === "audio" ? "danger" : "outline-danger"} onClick={() => filterMediaByType("audio")}>
          Audio
        </Button>
      </Container>
      <Container>
        <h4>{searchTerm ? `Displaying results for "${searchTerm}": ` : ""}</h4>
        <Row xs={1} md={3} className="g-4" style={{ margin: "auto" }}>
          {displayedMedia.map((media) => (
            <Col data-aos="fade-up" key={media.id} style={{ margin: "auto", padding: "20px" }}>
              {media.type === "image" && (
                <Card style={{ width: "20rem", margin: "auto" }}>
                  <Card.Img variant="top" src={media.url} alt={media.description} />
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
                    <source src={media.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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
              {media.type === "audio" && (
                <Card style={{ width: "20rem", margin: "auto", padding: "10px" }}>
                  <audio controls style={{ margin: "auto" }}>
                    <source src={media.url} type="audio/mp3" />
                    Your browser does not support the audio tag.
                  </audio>
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
            </Col>
          ))}
        </Row>
      </Container>

      <Container>
        <hr />
        <Row className="text-center">
          <p>
            ©2024 Copyright <strong className="text-danger">Medien de Azalea</strong>. All Rights Reserved
          </p>
        </Row>
      </Container>
    </div>
  );
};

export default ImageGallery;
