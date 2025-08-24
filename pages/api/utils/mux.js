import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export const createLiveStream = async (options = {}) => {
  const stream = await mux.video.liveStreams.create({
    playback_policy: ['public'],
    new_asset_settings: {
      playback_policy: ['public']
    },
    ...options
  });
  return stream;
};

export const getLiveStream = async (streamId) => {
  return await mux.video.liveStreams.retrieve(streamId);
};

export const listLiveStreams = async () => {
  return await mux.video.liveStreams.list();
};

export const deleteLiveStream = async (streamId) => {
  return await mux.video.liveStreams.del(streamId);
};

export default mux;
