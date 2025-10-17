import { useEffect, useState } from 'react';

const PageHeader = ({ data }) => {
  return (
    <div>
     <div className="page-header">
          <div className="page-block">
            <div className="row align-items-center">
              {/* <div className="col-md-8">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="#">{data.basePage}</a></li>
                  <li className="breadcrumb-item" aria-current="page">{data.pageclassName}</li>
                </ul>
              </div> */}
              <div className="col-md-10">
                <div className="page-header-title">
                <h2 className="mb-0">{data.pageclassName}</h2>
                </div>
              </div>
              <div class="col-2">
                    <button class="btn btn-primary" type="submit">Add Category</button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default PageHeader;
