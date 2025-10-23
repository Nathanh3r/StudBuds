class User {
  #name;
  #email
  #password;
  #major;
  #bio;
  #classlist = [];
  #friends = [];
  constructor(name, email, password, major, bio) {
    this.#name = name;
    this.#email = email;
    this.#password = password;
    this.#major = major;
    this.#bio = bio;
  }
  SetName(name) {
    this.#name = name;
  }
  SetEmail(email) {
    this.#email = email;
  }
  SetPassword(password) {
    this.#password = password;
  }
  SetMajor(major) {
    this.#major = major;
  }
  SetBio(bio) {
    this.#bio = bio;
  }
  GetName(name) {
    return this.#name;
  }
  GetEmail(email) {
    return this.#email;
  }
  GetPassword(password) {
    return this.#password;
  }
  GetMajor(major) {
    return this.#major;
  }
  GetBio() {
    return this.#bio;
  }
  Setclasslist(classes) {
    this.#classlist.push(classes);
  }
  Setfriends(friend) {
    this.#friends.push(friend);
  }
}

//const mongoose = require("mongoose");

//const UserSchema = new mongoose.Schema({
  //name: { type: String, required: true },
  //email: { type: String, required: true, unique: true },
  //password: { type: String, required: true },
  //createdAt: { type: Date, default: Date.now }
//});

//module.exports = mongoose.model("User", UserSchema);

student = User(shaun, smans, Shaunm$1, CSBA, Student);
log.console(student.GetBio);
