import React, { useEffect } from "react";
import ImageGallery from "./components/ImageGallery";
import "./App.css";

import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);
  return (
    <div className="App">
      <ImageGallery />
    </div>
  );
}

export default App;
