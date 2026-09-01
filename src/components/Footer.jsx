export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>&copy; <span>{year}</span> Abhishek Vadlamudi. Built from scratch, no template.</p>
        <a href="#top">Back to top &uarr;</a>
      </div>
    </footer>
  );
}
