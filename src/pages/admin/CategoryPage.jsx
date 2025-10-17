import { useEffect, useState } from 'react';
import PageHeader from '../../components/Admin/PageHeader';
import CategoryForm from '../../components/Admin/CategoryForm';

const Category = () => {
  return (
    <div>
      <PageHeader data={{ pageclassName: 'Category', basePage: 'Category', currentPage: 'Add Category' }} />
      <div className="row">
        <div className="col-md-12">
         <CategoryForm />
        </div>
      </div>
    </div>
  );
};

export default Category;