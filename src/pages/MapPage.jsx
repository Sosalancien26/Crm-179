import { useNavigate } from 'react-router-dom'
import MapFrance from '../components/map/MapFrance'
import { useClients } from '../hooks/useClients'
import { useParametres } from '../hooks/useParametres'

export default function MapPage () {
  const { clients } = useClients()
  const { byCat }   = useParametres()
  const nav = useNavigate()
  return (
    <MapFrance clients={clients} byCat={byCat}
      onOpenClient={(c)=> nav('/clients?id=' + c.id)}/>
  )
}
