const library = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "LibraryApp";
const addBookForm = document.getElementById("addBookForm");
const searchInput = document.getElementById("searchBookTitle");
const searchBookForm = document.getElementById("searchBookForm");

searchInput.addEventListener("keyup", (e) => {
   e.preventDefault();
   searchBooks();
});

searchBookForm.addEventListener("submit", (e) => {
   e.preventDefault();
   searchBooks();
});

// check if browser supports web storage
function storageAvailable() {
   if (typeof Storage === "undefined") {
      swal("Oops", "Sorry, your browser does not support web storage. Please use another browser", "info");
      return false;
   }
   return true;
}

// generate unique id for book
const generateId = () => +new Date();

// create book object
const createBookObject = (id, title, author, year, isComplete) => {
   return {
      id,
      title,
      author,
      year: Number(year),
      isComplete,
   };
};

// check if the book is completed
function isBookFinished() {
   const checkBox = document.getElementById("addBookFinished");
   return checkBox.checked;
}

// add book to library
function addBookToLibrary() {
   const bookTitle = document.getElementById("addBookTitle").value;
   const bookAuthor = document.getElementById("addBookAuthor").value;
   const bookYear = document.getElementById("addBookYear").value;
   const isComplete = isBookFinished();

   const id = generateId();
   const newBook = createBookObject(id, bookTitle, bookAuthor, bookYear, isComplete);

   library.unshift(newBook);
   document.dispatchEvent(new Event(RENDER_EVENT));
   saveLibraryData();

   swal("Success", "New book has been added to the shelf", "success");
}

// find book index by id
function findBookIndexById(bookId) {
   for (const index in library) {
      if (library[index].id == bookId) {
         return index;
      }
   }
   return null;
}

// remove book from library
function deleteBook(bookId) {
   const bookIndex = findBookIndexById(bookId);
   swal({
      title: "Are you sure?",
      text: "The book will be permanently deleted and you cannot recover it!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
   }).then((willDelete) => {
      if (willDelete) {
         library.splice(bookIndex, 1);
         document.dispatchEvent(new Event(RENDER_EVENT));
         saveLibraryData();

         swal("Success", "One book has been removed from the shelf", "success");
      } else {
         swal("The book was not deleted");
      }
   });
}

// clear all books from shelf
function clearShelf() {
   swal({
      title: "Are you sure?",
      text: "All books will be permanently deleted from the shelf, you cannot recover them!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
   }).then((willDelete) => {
      if (willDelete) {
         library.splice(0, library.length);
         document.dispatchEvent(new Event(RENDER_EVENT));
         saveLibraryData();

         swal("Success", "All books have been removed from the shelf", "success");
      } else {
         swal("The shelf was not cleared");
      }
   });
}

// change book status (read or unread)
function toggleBookStatus(bookId) {
   const bookIndex = findBookIndexById(bookId);
   for (const index in library) {
      if (index === bookIndex) {
         library[index].isComplete = !library[index].isComplete;
         swal("Success", `The book is now marked as ${library[index].isComplete ? 'completed' : 'unread'}`, "success");
      }
   }

   document.dispatchEvent(new Event(RENDER_EVENT));
   saveLibraryData();
}

// search for books
function searchBooks() {
   const searchValue = document.getElementById("searchBookTitle").value.toLowerCase();
   const unreadShelf = document.getElementById("unreadBookList");
   const readShelf = document.getElementById("readBookList");
   unreadShelf.innerHTML = "";
   readShelf.innerHTML = "";

   if (searchValue === "") {
      document.dispatchEvent(new Event(RENDER_EVENT));
      return;
   }

   for (const book of library) {
      if (book.title.toLowerCase().includes(searchValue)) {
         let el = `
         <article class="book-item">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Publication Year: ${book.year}</p>

            <div class="action">
               <button class="btn-green" onclick="toggleBookStatus(${book.id})">${book.isComplete ? 'Mark as Unread' : 'Mark as Read'}</button>
               <button class="btn-yellow" onclick="editBook(${book.id})">Edit</button>
               <button class="btn-red" onclick="deleteBook(${book.id})">Delete</button>
            </div>
         </article>`;
         if (book.isComplete) {
            readShelf.innerHTML += el;
         } else {
            unreadShelf.innerHTML += el;
         }
      }
   }
}

// edit book
function editBook(bookId) {
   const bookIndex = findBookIndexById(bookId);
   const editTitle = document.getElementById("editBookTitle");
   const editAuthor = document.getElementById("editBookAuthor");
   const editYear = document.getElementById("editBookYear");
   const saveEditBtn = document.getElementById("saveEdit");
   const cancelEditBtn = document.getElementById("cancelEdit");

   for (const index in library) {
      if (index === bookIndex) {
         editTitle.value = library[index].title;
         editAuthor.value = library[index].author;
         editYear.value = library[index].year;
         break;
      }
   }

   document.querySelector(".edit-section").style.display = "block";
   document.querySelector(".edit-section").scrollIntoView({
      behavior: "smooth",
   });

   const handleSaveEdit = (e) => {
      e.preventDefault();

      for (const index in library) {
         if (index == bookIndex) { // Make sure to use == for comparison
            library[index].title = editTitle.value;
            library[index].author = editAuthor.value;
            library[index].year = editYear.value;

            document.querySelector(".edit-section").style.display = "none";
            swal("Success", "The book has been edited", "success");
            break;
         }
      }

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveLibraryData();

      // Remove event listeners to prevent multiple bindings
      saveEditBtn.removeEventListener("click", handleSaveEdit);
      cancelEditBtn.removeEventListener("click", handleCancelEdit);
   };

   const handleCancelEdit = (e) => {
      e.preventDefault();
      document.querySelector(".edit-section").style.display = "none";
      document.getElementById("editBookForm").reset(); // Reset the form fields
      swal("Batal Edit", "Anda membatalkan untuk mengedit data buku", "info");

      // Remove event listeners to prevent multiple bindings
      saveEditBtn.removeEventListener("click", handleSaveEdit);
      cancelEditBtn.removeEventListener("click", handleCancelEdit);
   };

   saveEditBtn.addEventListener("click", handleSaveEdit);
   cancelEditBtn.addEventListener("click", handleCancelEdit);
}

document.addEventListener(RENDER_EVENT, function () {
   const unreadShelf = document.getElementById("unreadBookList");
   const readShelf = document.getElementById("readBookList");

   unreadShelf.innerHTML = "";
   readShelf.innerHTML = "";

   for (const book of library) {
      let el = `
      <article class="book-item">
         <h3>${book.title}</h3>
         <p>Author: ${book.author}</p>
         <p>Publication Year: ${book.year}</p>

         <div class="action">
            <button class="btn-green" onclick="toggleBookStatus(${book.id})">${book.isComplete ? 'Mark as Unread' : 'Mark as Read'}</button>
            <button class="btn-yellow" onclick="editBook(${book.id})">Edit</button>
            <button class="btn-red" onclick="deleteBook(${book.id})">Delete</button>
         </div>
      </article>`;
      if (book.isComplete) {
         readShelf.innerHTML += el;
      } else {
         unreadShelf.innerHTML += el;
      }
   }
});

// store books data to local storage
function saveLibraryData() {
   if (storageAvailable()) {
      const dataString = JSON.stringify(library);
      localStorage.setItem(STORAGE_KEY, dataString);
   }
}

// load books data from local storage
function loadLibraryData() {
   const serializedData = localStorage.getItem(STORAGE_KEY);
   if (serializedData !== null) {
      const data = JSON.parse(serializedData);
      for (const book of data) {
         library.unshift(book);
      }
   }
   document.dispatchEvent(new Event(RENDER_EVENT));
}

// on page load, call the loadLibraryData function
window.addEventListener("load", function () {
   loadLibraryData();
});

// add book form event
addBookForm.addEventListener("submit", function (e) {
   e.preventDefault();
   addBookToLibrary();
   addBookForm.reset();
});

