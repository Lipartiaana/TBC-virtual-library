const books = require("./data.json");
const users = require("./users.json");

function addBook(book) {
  const newId = books.length + 1;
  const newBook = {
    id: newId,
    title: book.title,
    author: book.author,
    genre: book.genre,
    year: book.year,
    isBorrowed: false,
    dateBorrowed: null,
    dueDate: null,
    rating: 0,
    borrowCount: 0,
  };

  books.push(newBook);
  console.log("Book added:", newBook);
}

function borrowBook(userName, bookId) {
  const user = users.find((u) => u.name === userName);
  const book = books.find((b) => b.bookId === bookId);

  if (!book) {
    console.log("Book not found");
    return;
  }

  if (!user) {
    console.log("Invalid user");
    return;
  }

  if (book.isBorrowed) {
    console.log("Book is already borrowed");
    return;
  }

  book.isBorrowed = true;
  book.dateBorrowed = new Date().toISOString().split("T")[0];
  book.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  book.borrowCount++;

  user.borrowedBooks.push({
    id: book.bookId,
    title: book.title,
    dateBorrowed: book.dateBorrowed,
    dueDate: book.dueDate,
    returnDate: null,
  });

  console.log(`"${book.title}" has been borrowed by ${user.name}`);
  console.log(user.borrowedBooks);
}

function returnBook(userName, bookId) {
  const user = users.find((u) => u.name === userName);
  const book = books.find((b) => b.bookId === bookId);

  if (!book) {
    console.log("Invalid book");
    return;
  }

  if (!user) {
    console.log("Invalid user");
    return;
  }

  const hasBook = user.borrowedBooks.find(
    (b) => b.bookId === bookId && b.returnDate === null
  );
  if (!hasBook) {
    console.log(`You did not borrow "${book.title}".`);
    return;
  }

  const currentDate = new Date().toISOString().split("T")[0];
  const dueDate = book.dueDate;
  if (currentDate > dueDate) {
    user.penaltyPoint -= 5;
    console.log(
      `You returned the book late and lost 5 points. Your current penalty point is: ${user.penaltyPoint}`
    );
  }

  book.isBorrowed = false;
  book.dateBorrowed = null;
  book.dueDate = null;

  hasBook.returnDate = currentDate;

  console.log(user.borrowedBooks);

  console.log(`Thank you for returning "${book.title}".`);
}

function searchBooksBy(param, value) {
  let results = [];

  if (param === "author") {
    results = books.filter((book) =>
      book.author.toLowerCase().includes(value.toLowerCase())
    );

    if (results.length === 0) {
      console.log(`No books found by author: "${value}"`);
    } else {
      console.log(`Books by author "${value}":`);
      results.forEach((book) => console.log("- " + book.title));
    }
  } else if (param === "genre") {
    results = books.filter((book) =>
      book.genre.toLowerCase().includes(value.toLowerCase())
    );
    if (results.length === 0) {
      console.log(`No books found in genre: "${value}"`);
    } else {
      console.log(`Books in genre "${value}":`);
      results.forEach((book) =>
        console.log(`- ${book.title} by ${book.author}`)
      );
    }
  } else if (param === "rating") {
    const minRating = parseFloat(value);
    results = books.filter((book) => book.rating >= value);
    if (results.length === 0) {
      console.log(`No books found with rating ≥ ${minRating}`);
    } else {
      console.log(`Books with rating ≥ ${minRating}:`);
      results.forEach((book) =>
        console.log(`- ${book.title} (${book.rating})`)
      );
    }
  } else if (param === "year") {
    if (typeof value !== "object" || !value.from || !value.to) {
      console.log(
        `For year search, provide value like: { from: 1900, to: 2000 }`
      );
      return [];
    }

    results = books.filter(
      (book) => book.year >= value.from && book.year <= value.to
    );

    if (results.length === 0) {
      console.log(`No books found from year ${value.from} to ${value.to}`);
    } else {
      console.log(`Books published between ${value.from} and ${value.to}:`);
      results.forEach((book) =>
        console.log(`- ${book.title} by ${book.author}`)
      );
    }
  } else {
    console.log("Invalid search parameter");
    return [];
  }
  return results;
}

function getTopRatedBooks(limit) {
  if (!limit || typeof limit !== "number" || limit <= 0) {
    console.log("Invalid limit");
    return [];
  }

  const sorted = books.slice().sort((a, b) => b.rating - a.rating);

  const topBooks = sorted.slice(0, limit);

  console.log(`Top ${limit} books by rating:`);
  topBooks.forEach((book, index) => {
    console.log(
      `${index + 1}. ${book.title} by ${book.author} (${book.rating})`
    );
  });

  return topBooks;
}

function getMostPopularBooks(limit) {
  if (!limit || typeof limit !== "number" || limit <= 0) {
    console.log("Invalid limit");
    return [];
  }

  const sorted = books.slice().sort((a, b) => b.borrowCount - a.borrowCount);

  const topBooks = sorted.slice(0, limit);

  console.log(`Top ${limit} books by borrow count:`);
  topBooks.forEach((book, index) => {
    console.log(
      `${index + 1}. ${book.title} by ${book.author} (${book.borrowCount})`
    );
  });

  return topBooks;
}

function checkOverdueUsers() {
  const today = new Date();
  const overdueUsers = [];

  users.forEach((user) => {
    const overdueBooks = [];

    user.borrowedBooks.forEach((book) => {
      if (!book.returnDate && new Date(book.dueDate) < today) {
        const dueDate = new Date(book.dueDate);
        const overdueDays = Math.floor(
          (today - dueDate) / (1000 * 60 * 60 * 24)
        );

        overdueBooks.push({
          title: book.title,
          dueDate: book.dueDate,
          daysOverdue: overdueDays,
        });
      }
    });

    if (overdueBooks.length > 0) {
      overdueUsers.push({
        username: user.name,
        overdueBooks,
      });
    }
  });

  if (overdueUsers.length === 0) {
    console.log("No overdue books found!");
  } else {
    console.log("Overdue Users:");
    overdueUsers.forEach((user) => {
      console.log(` ${user.username}`);
      user.overdueBooks.forEach((book) => {
        console.log(
          `   - "${book.title}" was due on ${book.dueDate} (${book.daysOverdue} days overdue)`
        );
      });
    });
  }

  console.log(JSON.stringify(overdueUsers, null, 2));

  return overdueUsers;
}

function recommendBooks(userName) {
  const user = users.find(
    (u) => u.name.toLowerCase() === userName.toLowerCase()
  );

  if (!user) {
    console.log("User not found.");
    return;
  }

  const borrowedBookIds = user.borrowedBooks.map((b) => b.bookId);
  const borrowedBooks = books.filter((b) => borrowedBookIds.includes(b.bookId));
  const borrowedGenres = [...new Set(borrowedBooks.map((b) => b.genre))];

  const recommended = books
    .filter(
      (b) =>
        borrowedGenres.includes(b.genre) && !borrowedBookIds.includes(b.bookId)
    )
    .sort((a, b) => b.rating - a.rating);

  console.log(`Recommendations for ${user.name}:`);

  if (recommended.length === 0) {
    console.log("No new books to recommend in your favorite genres.");
  } else {
    recommended.slice(0, 5).forEach((book) => {
      console.log(
        `${book.title} by ${book.author} (${book.genre}) — Rating: ${book.rating}`
      );
    });
  }

  return recommended;
}

function removeBook(bookId) {
  const bookIndex = books.findIndex((b) => b.bookId === bookId);
  if (bookIndex === -1) {
    console.log("Book not found.");
    return;
  }

  const book = books[bookIndex];

  if (book.isBorrowed) {
    console.log(
      `Can not delete "${book.title}" — the book is currently borrowed.`
    );
    return;
  }

  books.splice(bookIndex, 1);
  console.log(`Book "${book.title}" has been deleted from the library.`);
}

function printUserSummary(userName) {
  const user = users.find(
    (u) => u.name.toLowerCase() === userName.toLowerCase()
  );
  if (!user) {
    console.log("User not found.");
    return;
  }

  const today = new Date();
  const currentBooks = user.borrowedBooks.filter((b) => !b.returnDate);

  console.log(`Summary for ${user.name}`);
  console.log(`Currently Borrowed Books (${currentBooks.length}):`);
  console.log(`Penalty Points: ${user.penaltyPoint}`);

  if (currentBooks.length === 0) {
    console.log("  - Books not found");
  } else {
    currentBooks.forEach((b) => {
      const isOverdue = new Date(b.dueDate) < today;
      const status = isOverdue
        ? `Overdue (${Math.floor(
            (today - new Date(b.dueDate)) / (1000 * 60 * 60 * 24)
          )} days)`
        : `Due: ${b.dueDate}`;
      console.log(`  - ${b.title} - ${status}`);
    });
  }
}

// ==== Test cases ====

// 1. Add books

// addBook({
//   title: "კაცია ადამიანი?!",
//   author: "ილია ჭავჭავაძე",
//   genre: "ქართული ლიტერატურა",
//   year: 1878,
// });

// 2. Borrow book

// borrowBook("Ana", 2);
// borrowBook("Ana", 1);
// borrowBook("Ana", 100);
// borrowBook("Someone", 15);

// 3. Retun book

// returnBook("Lika", 1);
// returnBook("Ana", 21);
// returnBook("Lika", 5);
// returnBook("Lika", 100);
// returnBook("Someone", 15);

// 4. Search book

// searchBooksBy("author", "Fyodor Dostoevsky");
// searchBooksBy("genre", "Romance");
// searchBooksBy("rating", "4.8");
// searchBooksBy("year", { from: 1980, to: 2000 });

// 5. Get top rated books

// getTopRatedBooks(5);

// 6. Get most popular books

// getMostPopularBooks(3);

// 7. Check overdue users

// checkOverdueUsers();

// 8. redomend Books

// recommendBooks("Ana");
// recommendBooks("Giorgi");
// recommendBooks("Daviti");
// recommendBooks("Nini");
// recommendBooks("Luka");

// 9. Remove book

// removeBook(10);
// removeBook(1);

// 10. print User summary

// printUserSummary("Daviti");
// printUserSummary("Ana");
// printUserSummary("Mariami");
// printUserSummary("Kato");
// printUserSummary("Guga");
