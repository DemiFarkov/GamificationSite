import React, { useEffect, useRef, useState } from "react";
import classes from "./creatingAchievements.module.css";
import Header from "../../../components/general/header";
import Navigation from "../../../components/general/navigation";
import Column1 from "./column1";
import Column2 from "./column2";
import Column3 from "./column3";
import { instance } from "../../../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import {
  typeAchData,
  newTypeMainData,
  newTypeStyleData,
} from "../../../toolkitRedux/toolkitSlice";
import { getGroupsAuth } from "../../../hooks/reduxHooks";
import ModalNoAccess from "../../../components/general/modalNoAccess";
// import { oldAchievementsData } from "../../../toolkitRedux/toolkitSlice";
import fs from "fs";
import Not from "../../404Page/not";
const CreatingAchievements = () => {
  const group = getGroupsAuth();

  const [collectBackgrounds, setCollectBackgrounds] = useState([]);
  const [collectNonBackgrounds, setCollectNonBackgrounds] = useState([]);

  const [oldAchievements, setOldAchievements] = useState();
  const [valueOldAchievements, setValueOldAchievements] = useState(0);

  const [typeAchievements, setTypeAchievements] = useState(0);
  const [typeAchievementsSwitch, setTypeAchievementsSwitch] = useState(false);
  const [urlAvaPhoto, setUrlAvaPhoto] = useState({});
  const [urlItemPhoto, setUrlItemPhoto] = useState("");

  const [EXPValue, setEXPValue] = useState("");
  const [acoinValue, setAcoinValue] = useState("");

  const [achData, setAchData] = useState();
  const [fileBackground, setFileBackground] = useState();
  const [fileImage, setFileImage] = useState();

  const [description, setDescription] = useState("");
  const newTypeStyleDataSelector = useSelector(
    (state) => state.auth.newTypeStyleData
  );
  const [backUrl, setBackUrl] = useState();
  const [frontUrl, setFrontUrl] = useState();
  const [nameAchievements, setNameAchievements] = useState("");

  const dispatch = useDispatch();
  const achCurrentData = useSelector(
    (state) => state.auth.currentAchievementsData
  );
  const MainDataSelector = useSelector((state) => state.auth.newTypeMainData);

  function dataValidation() {
    // if
  }
  function collectDataRequest() {
    const formData = new FormData();
    let styleCard = {
      border_color: newTypeStyleDataSelector.border_color,
      border_style: newTypeStyleDataSelector.border_style,
      border_width: newTypeStyleDataSelector.border_width,
      textColor: newTypeStyleDataSelector.textColor,
      use_border: newTypeStyleDataSelector.use_border,
    };
    console.log(styleCard);
    let typeAchContent = typeAchievementsSwitch
      ? {}
      : {
          difficulty: "Medium",
          request_type: null,
          required_count: 10,
          type_specific_data: {
            additional_field_1: "value1",
            additional_field_2: "value2",
          },
        };
    let dataRq = {
      image: "http://shaman.pythonanywhere.com/media/achievements/default.jpg",
      background_image:
        "http://shaman.pythonanywhere.com/media/achievement_backgrounds/bg.jpg",
    };
    formData.append("typeAchContent", JSON.stringify(typeAchContent));
    formData.append("styleCard", JSON.stringify(styleCard));
    formData.append("name", nameAchievements);
    formData.append("description", MainDataSelector.description);
    formData.append("type", typeAchievements);
    formData.append("reward_experience", EXPValue);
    formData.append("reward_currency", acoinValue);
    formData.append("is_award", typeAchievementsSwitch);
    formData.append("is_double", MainDataSelector.is_double);
    !fileBackground && formData.append("template_background", urlAvaPhoto.id); // ID шаблона, который используется как фон
    !fileImage && formData.append("template_foreground", urlItemPhoto.id); // ID шаблона, который используется как изображение на переднем плане
    fileBackground && formData.append("background_image", fileBackground);
    fileImage && formData.append("foreground_image", fileImage);

    console.log("typeAchContent", typeAchContent);

    for (let [name, value] of formData.entries()) {
      console.log(name, value);
    }
    // formData.append("image", typeAchievementsSwitch);
    // formData.append("background_image", typeAchievementsSwitch);
    return formData;
  }
  useEffect(() => {
    group == "Администраторы" && getData();

    return () => {
      // dispatch(newTypeStyleData({})),
      //   dispatch(typeAchData({})),
      //   dispatch(newTypeMainData({}));
    };
  }, []);
  useEffect(() => {
    group == "Администраторы" &&
      valueOldAchievements > 0 &&
      (setEXPValue(MainDataSelector.reward_experience),
      setAcoinValue(MainDataSelector.reward_currency),
      (document.querySelector(`#${"addBackSide"}`).checked =
        MainDataSelector.is_double),
      setNameAchievements(MainDataSelector.name));
  }, [valueOldAchievements]);

  function getData() {
    instance.get(`achievements/`).then((response) => {
      console.log(response.data);
      setOldAchievements(response.data);
      // dispatch(oldAchievementsData(response.data));
    });
    instance.get(`templates/`).then((response) => {
      console.log(response.data);
      setCollectBackgrounds(response.data.backgrounds);
      setCollectNonBackgrounds(response.data.non_backgrounds);
    });
  }
  function sendData() {
    instance
      .post(`achievements/`, collectDataRequest())
      .then((response) => {
        console.log(response);
      })
      .catch((response) => {
        console.log(response);
      });
  }
  useEffect(() => {
    if (group == "Администраторы") {
      if (fileBackground) {
        const file = fileBackground;

        const readerBack = new FileReader();
        readerBack.onloadend = () => {
          setBackUrl(readerBack.result);
        };

        readerBack.readAsDataURL(file);
      }
      if (fileImage) {
        const file = fileImage;

        const readerBack = new FileReader();
        readerBack.onloadend = () => {
          setFrontUrl(readerBack.result);
        };

        readerBack.readAsDataURL(file);
      }
      let ojbMainData = {
        name: nameAchievements,
        description: description,
        type: typeAchievements,
        reward_experience: EXPValue,
        reward_currency: acoinValue,
        is_award: typeAchievementsSwitch,
        urlAvaPhoto: urlAvaPhoto.url,
        urlItemPhoto: urlItemPhoto.url,
        is_double: document.querySelector(`#addBackSide`).checked,
      };
      dispatch(newTypeMainData({ ...MainDataSelector, ...ojbMainData }));
    }
  }, [
    nameAchievements,
    EXPValue,
    acoinValue,
    fileBackground,
    fileImage,
    urlItemPhoto,
    urlAvaPhoto,
    description,
    typeAchievementsSwitch,
  ]);
  // Для сраных фото
  useEffect(() => {
    console.log(backUrl);
    setFileBackground(backUrl);
    dispatch(
      newTypeMainData({
        ...MainDataSelector,
        background_image: backUrl,
      })
    );
  }, [backUrl]);
  useEffect(() => {
    setFileImage(frontUrl);
    dispatch(
      newTypeMainData({
        ...MainDataSelector,
        foreground_image: frontUrl,
      })
    );
  }, [frontUrl]);
  return (
    <div>
      {group == "Администраторы" ? (
        <>
          <Header />
          <div className={classes.mainContainer}>
            <Navigation />{" "}
            <div className={classes.mainContent}>
              <h1 className={classes.H1}>Редактор наград/достижений</h1>

              <div className={classes.mainBlock}>
                <Column1
                  valueOldAchievements={valueOldAchievements}
                  setValueOldAchievements={setValueOldAchievements}
                  nameAchievements={nameAchievements}
                  urlAvaPhoto={urlAvaPhoto}
                  urlItemPhoto={urlItemPhoto}
                  achData={achData}
                  oldAchievements={oldAchievements}
                  fileImage={fileImage}
                  fileBackground={fileBackground}
                />
                <Column2
                  nameAchievements={nameAchievements}
                  setNameAchievements={setNameAchievements}
                  typeAchievements={typeAchievements}
                  setTypeAchievements={setTypeAchievements}
                  typeAchievementsSwitch={typeAchievementsSwitch}
                  setTypeAchievementsSwitch={setTypeAchievementsSwitch}
                  setUrlAvaPhoto={setUrlAvaPhoto}
                  setUrlItemPhoto={setUrlItemPhoto}
                  setAchData={setAchData}
                  achData={achData}
                  description={description}
                  setDescription={setDescription}
                  EXPValue={EXPValue}
                  setEXPValue={setEXPValue}
                  acoinValue={acoinValue}
                  setAcoinValue={setAcoinValue}
                  setFileImage={setFileImage}
                  fileImage={fileImage}
                  setFileBackground={setFileBackground}
                  fileBackground={fileBackground}
                  collectBackgrounds={collectBackgrounds}
                  collectNonBackgrounds={collectNonBackgrounds}
                />
                <Column3
                  sendData={sendData}
                  fileBackground={fileBackground}
                  fileImage={fileImage}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <Not />
      )}
    </div>
  );
};

export default CreatingAchievements;
