export const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, statusCode = 500, message = 'Error') => {
  console.log('send error : ',message)
  res.status(statusCode).json({
    success: false,
    message,
  });
};



 export   const addDisplayDate = (blogs) =>
      blogs.map((blog) => {
        const doc = blog.toObject ? blog.toObject() : blog;
        doc.displayDate = blog.publishedAt || blog.draftedAt || blog.createdAt;
        return doc;
      });