export default class Contact {
  name: string;
  phone: string;
  email?: string;
  address: string;
  id?: string;
  dateAdded?: Date;
  lastActivity?: Date;

  constructor(
    name: string,
    phone: string,
    email: string,
    address: string,
    id?: string,
    dateAdded = new Date(),
    lastActivity = new Date()
  ) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.id = id; // Firestore ID
    this.dateAdded = dateAdded;
    this.lastActivity = lastActivity;
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address,
      dateAdded: this.dateAdded ? this.dateAdded.toISOString() : null,
      lastActivity: this.lastActivity ? this.lastActivity.toISOString() : null,
    };
  }
}
