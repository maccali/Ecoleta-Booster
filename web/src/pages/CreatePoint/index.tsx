import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import apiIbge from '../../services/apiIbge';

import './styles.css'

import logo from '../../assets/logo.svg'

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

  const [nomeEntidade, setNomeEntidade] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const history = useHistory()

  useEffect(() => {
    api.get('items')
      .then(response => {
        setItems(response.data)
      })
  }, [])

  useEffect(() => {
    apiIbge.get<IBGEUFResponse[]>('localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla)
        setUfs(ufInitials)
      })
  }, [])

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }
    apiIbge.get<IBGECityResponse[]>(`localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityInitials = response.data.map(city => city.nome)
        setCities(cityInitials)
      })
  }, [selectedUf])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setSelectedPosition([
        position.coords.latitude,
        position.coords.longitude
      ])
    })
  }, [])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value
    setSelectedUf(uf)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value
    setSelectedCity(city)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ])
  }

  function handleSelectItem(id: number) {
    const alreadSelected = selectedItems.findIndex(item => item === id);

    if (alreadSelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const [latitude, longitude] = selectedPosition

    const data = {
      name: nomeEntidade,
      email,
      whatsapp,
      uf: selectedUf,
      city: selectedCity,
      latitude,
      longitude,
      items: selectedItems
    }

    await api.post('points', data)

    alert('Ponto de coleta criado')

    history.push('/')
  }

  return (
    <>
      <div id="page-create-point">
        <header>
          <img src={logo} alt="" />
          <Link to="/">
            <FiArrowLeft />
            Voltar Para Home
          </Link>
        </header>
        <form onSubmit={handleSubmit}>
          <h1>Cadastro do <br /> ponto de coleta</h1>
          <fieldset>
            <legend>
              <h2>
                Dados
              </h2>
            </legend>
            <div className="field">
              <label htmlFor="name">Nome da Entidade</label>
              <input
                type="text"
                name="name"
                id="name"
                value={nomeEntidade}
                onChange={e => setNomeEntidade(e.target.value)}
              />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>
                Endereço
              </h2>
              <span>Selecione o endereço no mapa</span>
            </legend>
            <Map center={selectedPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedPosition == [0, 0] ? '' :

                <Marker position={selectedPosition} />
              }
            </Map>
            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                  <option value="0">Selecione uma UF</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                  <option value="0">Selecione uma Cidade</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>
                Ítens de Coleta
              </h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>
            <ul className="items-grid">
              {items.map(item =>
                <li
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              )}

            </ul>
          </fieldset>
          <button type="submit">
            Cadastrar Ponte de Coleta
          </button>
        </form>
      </div>
    </>
  )
}

export default CreatePoint;