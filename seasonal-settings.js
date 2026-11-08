(function(){
  const URL='https://wnhzgxnwlmohfldnhhyt.supabase.co';
  const KEY='sb_publishable_x5Xkl7tfpUwhz_ENftiaqQ_am915vqY';
  window.HFFSeasonal={
    async get(key){
      try{
        if(!window.supabase) return false;
        const c=supabase.createClient(URL,KEY);
        const {data,error}=await c.from('hff_site_settings').select('enabled').eq('setting_key',key).maybeSingle();
        if(error) throw error;
        return data?.enabled===true;
      }catch(e){console.warn('Seasonal setting unavailable:',key,e);return false;}
    }
  };
})();
