import React, { Component } from "react";
import Notifications, { notify } from "react-notify-toast";
import qs from "query-string";
import ImageGallery from "react-image-gallery";
import Gallery from "react-grid-gallery";
import { isMobile } from "react-device-detect";

import Spinner from "./Spinner";
import Error from "./Error";
import Images from "./Images";
import Buttons from "./Buttons";
import WakeUp from "./WakeUp";
import { API_URL } from "./config";
import "./App.css";
import { dataURLToBlob, handleErrors } from "./utils";

const toastColor = {
  background: "#505050",
  text: "#fff"
};

export default class App extends Component {
  state = {
    loading: true,
    uploading: false,
    images: [],
    gallery: []
  };

  componentDidMount() {
    const params = qs.parse(window.location.search);
    console.log(params);
    console.log(params.app);
    this.setState({ app: params.app });
    fetch(`${API_URL}/${params.app}`)
      .then(handleErrors)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        const msg = "Something is went wrong with Heroku...";
        this.toast(msg, "custom", 2000, toastColor);
      })
      .then(config => {
        return this.setState({
          loading: false,
          title: config.title,
          subTitle: config.subTitle
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({ loading: false, error: true });
      });
    fetch(`${API_URL}/list/${params.app}`)
      .then(handleErrors)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(list => {
        console.log(list);
        this.setState({
          gallery: !list
            ? []
            : list.map(i => ({
                src: i,
                thumbnail: i,
                thumbnailWidth: 50,
                thumbnailHeight: 50
              }))
        });
      })
      .catch(error => console.log(error));
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
        formData.append(i, file, file.name);
        fetch(`${API_URL}/image-upload/${this.state.app}`, {
          method: "POST",
          body: formData
        })
          .then(res => {
            if (!res.ok) {
              throw res;
            }
            return res.json();
          })
          .then(videos => {
            this.setState({
              uploading: i < count - 1,
              videos
            });
          })
          .catch(err => {
            err.json().then(e => {
              this.toast(e.message, "custom", 2000, toastColor);
              this.setState({ uploading: false });
            });
          });
      } else {
        this.setState({ uploading: true });
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
            formData.append(i, resizedImage, file.name);
            fetch(`${API_URL}/image-upload/${this.state.app}`, {
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
                console.log(images);
                console.log(i, count);
                this.setState({
                  uploading: false,
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

  getTodayFact = () => {
    fetch(`${API_URL}/today`)
    .then(res => {
      if (res.ok) {
        return res.json();      
      }
    }).then(todayFact => {
      console.log(todayFact);
      this.setState({todayFact: `${todayFact.year}: ${todayFact.text}`});
    });
  }

  render() {
    const {
      title,
      subTitle,
      gallery,
      loading,
      uploading,
      error,
      images,
      todayFact
    } = this.state;

    const content = () => {
      switch (true) {
        case loading:
          return <WakeUp />;
        case uploading:
          return <Spinner />;
        case error:
          return <Error />;
        case images.length > 0:
          return (
            <div className="images-wrapper">
              <Buttons onChange={this.onChange} />
              <Images onError={this.onError} />
            </div>
          );
        default:
          return <Buttons onChange={this.onChange} />;
      }
    };

    return (
      <div className="container">
        <Notifications />
        <div className="center-text title">{title}</div>
        <div className="center-text subtitle">{subTitle}</div>
        <div className="upload-container">
          <div className="center-text">שתפו תמונות מהאירוע!</div>
          <div onClick={this.getTodayFact}>today fact</div>
          {todayFact && <div>{todayFact}</div>}
          <div className="buttons">{content()}</div>
        </div>
        <div className="gallery-content">
            <Gallery images={gallery} lightboxWidth={isMobile ? 300 : 1536} />
          </div>
      </div>
    );
  }
}
