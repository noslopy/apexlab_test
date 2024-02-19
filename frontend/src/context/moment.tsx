import React, {
  useState,
  createContext,
  ReactNode,
  useReducer,
  useEffect,
} from 'react'
import {
  FacingModes,
  momentReducer,
  TakePhotoActions,
  TakePhotoActionType,
  TakePhotoState,
  TakePhotoSteps,
} from './moment.reducer'
import { postImage, getS3UrlFromUrl } from '../services/image'

const initialMomentState = {
  step: TakePhotoSteps.Initialize,
  facingMode: FacingModes.environment,
  environmentImage: '',
  userImage: '',
}

type MomentContextState = {
  s3UploadUrl: string | null
  images: string[]
  setImages: React.Dispatch<React.SetStateAction<string[]>>
  appState: TakePhotoState
  dispatchAppStateAction: React.Dispatch<TakePhotoActionType>
}

export const MomentContext = createContext({} as MomentContextState)
export const MomentContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [images, setImages] = useState<string[]>([])
  const [appState, dispatchAppStateAction] = useReducer(
    momentReducer,
    initialMomentState
  )

  const s3UploadUrl = getS3UrlFromUrl()

  useEffect(() => {
    if (appState.step === TakePhotoSteps.Uploading) {
      postImage()
        .then(() => {
          dispatchAppStateAction({ type: TakePhotoActions.UPLOAD_SUCCESS })
        })
        .catch((error: Error) => {
          console.error(error)
        })
    }
  }, [appState.step])

  return (
    <MomentContext.Provider
      value={{
        s3UploadUrl,
        images,
        setImages,
        appState,
        dispatchAppStateAction,
      }}
    >
      {children}
    </MomentContext.Provider>
  )
}
