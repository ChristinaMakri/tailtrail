import { NavigatorScreenParams } from '@react-navigation/native'
import { Pet, Match } from '../types'

export type AuthStackParams = {
  Welcome: undefined
  Login: undefined
  Register: undefined
}

export type HomeStackParams = {
  Feed: undefined
  PetDetail: { petId: string }
}

export type ReportStackParams = {
  ReportChoice: undefined
  ReportLost: undefined
  ReportFound: undefined
}

export type MatchesStackParams = {
  MatchesList: undefined
}

export type ProfileStackParams = {
  ProfileMain: undefined
}

export type AppTabParams = {
  HomeTab: NavigatorScreenParams<HomeStackParams>
  ReportTab: NavigatorScreenParams<ReportStackParams>
  MatchesTab: NavigatorScreenParams<MatchesStackParams>
  ProfileTab: NavigatorScreenParams<ProfileStackParams>
}

export type RootStackParams = {
  Auth: NavigatorScreenParams<AuthStackParams>
  App: NavigatorScreenParams<AppTabParams>
}
