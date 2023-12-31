import { useState, useEffect } from 'react'
import axios from 'axios'
import personsService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [notification, setNotification] = useState(null)
  const [nameFilter, setNameFilter] = useState('')

  useEffect(()=>{
      personsService.getAll().then((allPersons)=>{
        setPersons(allPersons)
      })
  }, [])

  const handleOnChangeName = (event) => {
    let value = event.target.value
    setNewName(value);
  }

  const handleOnChangeNameFilter = (event) => {
    let value = event.target.value
    setNameFilter(value);
  }
  const handleOnChangeNumber = (event) => {
    let value = event.target.value
    setNewNumber(value);
  }

  const saveToPhonebook = (event) => {
    event.preventDefault()
    const personAlreadyInBook = persons.find(person => person.name == newName);
    if (personAlreadyInBook !== undefined) {
      const update = window.confirm(`${newName} is already added to phonebook. Do you want to replace the current number?`)
      if(!update)
        return
      else{
        personsService.update({...personAlreadyInBook, number: newNumber}).then((updatedPerson) => {
          setPersons(persons.map(person => person.id !== updatedPerson.id? person : updatedPerson))
        })
        return
      }  
    }
    const newPerson = { name: newName, number: newNumber }
    console.log(newPerson)
    personsService.create(newPerson).then(createdPerson => {
      console.log(createdPerson)
      setNotification({message: `Added ${createdPerson.name}`, color: 'green'});
      
      setInterval(()=>setNotification(null),3000);
      setPersons(persons.concat(createdPerson))
    })
    
    setNewName("")
    setNewNumber("")
  }

  const deleteEntry = (personTodelete) => {
    window.confirm(`Delete ${personTodelete.name}?`)
    personsService.deleteEntry(personTodelete.id).then(deletedPerson =>{
      console.log(deletedPerson)
      setPersons(persons.filter(person => person.id !== personTodelete.id))
    }).catch(()=>{
      setNotification({message: `Information of ${personTodelete.name} has already been removed from server`, color: 'red'});
      setInterval(()=>setNotification(null),3000);
    })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification = {notification}/>
      <Filter nameFilter={nameFilter} handleOnChangeNameFilter={handleOnChangeNameFilter}/>
      <PersonForm newName={newName} newNumber={newNumber} handleOnChangeName={handleOnChangeName} handleOnChangeNumber={handleOnChangeNumber} saveToPhonebook={saveToPhonebook}/>
      <Numbers nameFilter={nameFilter} persons={persons} deleteEntry ={deleteEntry}/>
    </div>
  )
}

const Notification = ({notification}) => {
  console.log(notification)
  if(notification === null)
    return null
  const color = notification.color
  const notificationStyle = {
    color: `${color}`,
    backgroundColor: 'gainsboro',
    border: `2px solid ${color}`,
    padding: '10px'
  }

  return(
    <h1 style = {notificationStyle}>{notification.message}</h1>
  )
} 

const Numbers = ({ nameFilter, persons, deleteEntry }) => {
  const filteredPersons = persons.filter(person => person.name.includes(nameFilter))
  return (
    filteredPersons.map(person => <Person person={person} key={person.id} deleteEntry ={deleteEntry}></Person>)
  )
}

const Filter = ({nameFilter, handleOnChangeNameFilter}) => {
  return(
    <form>
        <div>
          filter by name: <input id="nameFilter" value={nameFilter} onChange={handleOnChangeNameFilter} />
        </div>
      </form>
  )
}

const PersonForm = ({newName, newNumber, handleOnChangeName, handleOnChangeNumber, saveToPhonebook}) => {
  return(
    <div>
      <h2>Add new</h2>
        <form>
          <div>
            name: <input id="nameInput" value={newName} onChange={handleOnChangeName} />
          </div>
          <div>number: <input id="numberInput" value={newNumber} onChange={handleOnChangeNumber} /></div>
          <div>debug: {newName}</div>
          <div>
            <button type="submit" onClick={saveToPhonebook}>add</button>
          </div>
        </form>
      </div>
    )
}

const Person = ({ person, deleteEntry }) => <div key={person.name}>{person.name}: {person.number}
<button onClick={()=>deleteEntry(person)}>delete</button>
</div>

export default App