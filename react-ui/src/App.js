import React, { Component } from "react";
import Notifications, { notify } from "react-notify-toast";

import Spinner from "./Spinner";
import Images from "./Images";
import Buttons from "./Buttons";
import WakeUp from "./WakeUp";
import Footer from "./Footer";
import { API_URL } from "./config";
import "./App.css";
import { dataURLToBlob } from "./utils";

const toastColor = {
  background: "#505050",
  text: "#fff"
};

export default class App extends Component {
  state = {
    loading: true,
    uploading: false,
    images: []
  };

  componentDidMount() {
    fetch(`${API_URL}/wake-up`).then(res => {
      if (res.ok) {
        return this.setState({ loading: false });
      }
      const msg = "Something is went wrong with Heroku...";
      this.toast(msg, "custom", 2000, toastColor);
    });
  }

  toast = notify.createShowQueue();

  onChange = e => {
    const errs = [];
    const files = Array.from(e.target.files);

    if (files.length > 30) {
      const msg = "Only 30 images can be uploaded at a time";
      return this.toast(msg, "custom", 2000, toastColor);
    }

    const count = files.length;
    files.forEach((file, i) => {
      if (file.type.startsWith("video")) {
        const formData = new FormData();
        formData.append(i, file);
        fetch(`${API_URL}/image-upload`, {
          method: "POST",
          body: formData
        })
          .then(res => {
            if (!res.ok) {
              throw res;
            }
            return res.json();
          })
          .then(images => {
            this.setState({
              uploading: i === count - 1,
              images
            });
          })
          .catch(err => {
            err.json().then(e => {
              this.toast(e.message, "custom", 2000, toastColor);
              this.setState({ uploading: false });
            });
          });
      } else {
        const reader = new FileReader();
        reader.onload = e => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement("canvas"),
              max_size = 2000;
            let width = image.width,
              height = image.height;
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(image, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg");

            const resizedImage = dataURLToBlob(dataUrl);
            const formData = new FormData();
            formData.append(i, resizedImage);
            fetch(`${API_URL}/image-upload`, {
              method: "POST",
              body: formData
            })
              .then(res => {
                if (!res.ok) {
                  throw res;
                }
                return res.json();
              })
              .then(images => {
                this.setState({
                  uploading: i === count - 1,
                  images
                });
              })
              .catch(err => {
                err.json().then(e => {
                  this.toast(e.message, "custom", 2000, toastColor);
                  this.setState({ uploading: false });
                });
              });
          };
          image.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    if (errs.length) {
      return errs.forEach(err => this.toast(err, "custom", 2000, toastColor));
    }

    this.setState({ uploading: true });
  };

  filter = id => {
    return this.state.images.filter(image => image.public_id !== id);
  };

  removeImage = id => {
    this.setState({ images: this.filter(id) });
  };

  onError = id => {
    this.toast("Oops, something went wrong", "custom", 2000, toastColor);
    this.setState({ images: this.filter(id) });
  };

  render() {
    const { loading, uploading, images } = this.state;

    const content = () => {
      switch (true) {
        case loading:
          return <WakeUp />;
        case uploading:
          return <Spinner />;
        case images.length > 0:
          return (
            <Images
              images={images}
              removeImage={this.removeImage}
              onError={this.onError}
            />
          );
        default:
          return <Buttons onChange={this.onChange} />;
      }
    };

    return (
      <div className="container">
        <Notifications />
        <div className="center-text title">הכנסת ספר תורה</div>
        <div className="center-text subtitle">משפחת עזריאל - 6.6.2019</div>
        <div className="center-text">שתפו תמונות מהאירוע!</div>
        <div className="buttons">{content()}</div>
      </div>
    );
  }
}
