import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useViewport } from "../../../contexts/ViewportContext";
import "../../../../ui/css/HomeMain.css";

const MainCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { translations: currentLanguage } = useLanguage();
  const { isMobileViewport } = useViewport();

  useEffect(() => {
    setCategories([
      {
        id: 1,
        name: "Fruits",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F006e3233f722864bf279c907733bd4fc3d223a22.png?alt=media&token=3dc68fa0-306d-4e5b-8923-5e675ddf3ec9",
      },
      {
        id: 2,
        name: "Vegetables",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F322a393bfb53088ec1ecaaf875effd8ee9d68299.png?alt=media&token=1e10ad2f-d9a7-4280-a660-69d36aa880e0",
      },
      {
        id: 3,
        name: "Dairy",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F346714d28f089ddd37f7d09fc8868937512f1c17.png?alt=media&token=3da76e1f-202a-4404-9424-f2d6ea916702",
      },
      {
        id: 4,
        name: "Bakery",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F349a1f377e05e0455a21392a037dc1b4b28a6a27.png?alt=media&token=77aba62b-7519-4bd7-816d-5d70e20fd9f0",
      },
      {
        id: 5,
        name: "Meat",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F53bf0ed9ff7229f7e33e0b3e280f00e912d1fcc7.png?alt=media&token=3da67c2b-91cf-49a7-8fdc-fd1b48da4a9c",
      },
      {
        id: 6,
        name: "Beverages",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F9ff021b3635e4f77177ed80b9fd5b7c1ed8da485.png?alt=media&token=d04964ae-4063-4a6c-92c5-f4a387435161",
      },
      {
        id: 7,
        name: "Snacks",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2Fc50ce1cc7978774e8070c27d680dfc04b299342e.png?alt=media&token=7b99cb15-495d-42f5-ad77-93ba69913f83",
      },
      {
        id: 8,
        name: "Canned",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2Fdb9cf8f8d3698971e39c37e896f9e983e186c75b.png?alt=media&token=54f3164b-834f-42e1-b252-c6d324b979c0",
      },
      {
        id: 1,
        name: "Fruits",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F006e3233f722864bf279c907733bd4fc3d223a22.png?alt=media&token=3dc68fa0-306d-4e5b-8923-5e675ddf3ec9",
      },
      {
        id: 2,
        name: "Vegetables",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F322a393bfb53088ec1ecaaf875effd8ee9d68299.png?alt=media&token=1e10ad2f-d9a7-4280-a660-69d36aa880e0",
      },
      {
        id: 3,
        name: "Dairy",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F346714d28f089ddd37f7d09fc8868937512f1c17.png?alt=media&token=3da76e1f-202a-4404-9424-f2d6ea916702",
      },
      {
        id: 4,
        name: "Bakery",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F349a1f377e05e0455a21392a037dc1b4b28a6a27.png?alt=media&token=77aba62b-7519-4bd7-816d-5d70e20fd9f0",
      },
      {
        id: 5,
        name: "Meat",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F53bf0ed9ff7229f7e33e0b3e280f00e912d1fcc7.png?alt=media&token=3da67c2b-91cf-49a7-8fdc-fd1b48da4a9c",
      },
      {
        id: 6,
        name: "Beverages",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F9ff021b3635e4f77177ed80b9fd5b7c1ed8da485.png?alt=media&token=d04964ae-4063-4a6c-92c5-f4a387435161",
      },
      {
        id: 7,
        name: "Snacks",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2Fc50ce1cc7978774e8070c27d680dfc04b299342e.png?alt=media&token=7b99cb15-495d-42f5-ad77-93ba69913f83",
      },
      {
        id: 8,
        name: "Canned",
        image_url:
          "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2Fdb9cf8f8d3698971e39c37e896f9e983e186c75b.png?alt=media&token=54f3164b-834f-42e1-b252-c6d324b979c0",
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="main-category py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="main-category py-5">
      <div className="mainCategory-container">
        <div className="row">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className={`col-lg-8per col-md-3 col-sm-4 col-6 mb-4 ${
                  isMobileViewport ? "text-center" : ""
                }`}
              >
                <Link
                  to="/restaurant"
                  className={`category-card ${
                    isMobileViewport ? "mobile" : ""
                  }`}
                >
                  <div className="category-image mb-3">
                    <img
                      src={
                        category.image_url ||
                        "/assets/images/default-category.png"
                      }
                      alt={category.name}
                      className={`category-img ${
                        isMobileViewport ? "mobile" : ""
                      }`}
                    />
                  </div>
                  <h6
                    className={`category-name ${
                      isMobileViewport ? "mobile" : ""
                    }`}
                  >
                    {isMobileViewport && category.name.length > 12
                      ? category.name.substring(0, 12) + "..."
                      : category.name}
                  </h6>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">No categories available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MainCategory;
