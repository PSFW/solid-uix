import { localWebid } from './utils';

describe('Utils functions', () => {
    beforeEach(() => {
     
    });
  
    it('should return preloaded localWebid', async () => {
      window.SolidAppContext.webId = "exampleWebId";

      let currentWebId = await localWebid();
      expect(currentWebId).toBe("exampleWebId");
    });
  });