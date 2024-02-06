import './app.scss';
import { APP_CONTAINER_ID } from './constants';
import { renderHome } from './home';
import { getElementByIdOrThrow } from './utils';

export const bootstrapApp = async (): Promise<void> => {
  const appElement = getElementByIdOrThrow<HTMLDivElement>(APP_CONTAINER_ID);

  await renderHome(appElement);
};
